# Tears of Guthix Crowdsourcing

Thanks for checking out this repo! This particular repo consists of the website component of ToG Crowdsourcing, but I will use this space to talk about the project and describe the technical challenges that I encountered. 

If you would like to visit the live website for this repo, it is found here: https://togcrowdsourcing.com

<h2>Goal of ToG Crowdsourcing</h2>
ToG Crowdsourcing was made to try to help save everyone time finding the optimal Tears of Guthix world. Every week, the Old School Runescape servers reset and the optimal worlds change. ToG Crowdsourcing aims to collect data about each world automatically and share the data to help all users find the optimal worlds each week, without having to hop to each world to find them themselves. 


<h2>Quick Summary of Solution</h2>
Many Old School Runescape players (around 45% of active players) use a third-party client called RuneLite. RuneLite is open source, and allows the community to contribute their own plugins. I have created a plugin for RuneLite that crowdsources the optimal Tears of Guthix world. The plugin sends data to an external server, and the server then shares that data with users. 

<h2>Project Components</h2>

1. RuneLite plugin that collects data. [https://github.com/jcarbelbide/tog-crowdsourcing](https://github.com/jcarbelbide/tog-crowdsourcing)
2. External Server that agregates data. [https://github.com/jcarbelbide/tog-crowdsourcing-server](https://github.com/jcarbelbide/tog-crowdsourcing-server)
3. External Server that monitors the OldSchool RuneScape servers for a reset. [https://github.com/jcarbelbide/js5-monitor](https://github.com/jcarbelbide/js5-monitor)
4. Web-app for non-RuneLite or mobile players. [(This repo)](https://github.com/jcarbelbide/togcrowdsourcing.com)

<h2>Technologies Used</h2>

This project uses the following technologies: 
1. Java - RuneLite is written in Java.
2. Go - The external server code is written in Go.
3. React - Web-app is created with React. 
4. SQLite - Database component. 
5. Nginx - For reverse proxying, setting up an HTTPS connection, and static web-page hosting. 
6. AWS - Server is hosted on a lightsail instance. Lightsail was chosen for its predictable cost. 
7. Cloudflare - Protection from DDOS attacks and other malicious requests. 
8. SHA256 - Used to hash user data. This was chosen because it is cryptographically secure. 

<h2>Technical Challenges</h2>

These are some of the technical issues that I encountered that I will touch on in this Readme:

1. What data do we collect, and how do we collect it? 
2. How do we protect the user's privacy?
3. How do we agregate the data and share it with everyone? 
4. How do we know when the weekly server reset happens and the collected data must be reset? 
5. How do we minimize server load and costs?
6. How do we avoid malicious requests to our server? 

<h2>Project Deep Dive</h2>

<h3>What data do we collect, and how do we collect it?</h3>

In the OldSchool RuneScape minigame "Tears of Guthix", there are worlds that contain better conditions for maximizing the benefits of this weekly minigmae. This is explained in more detail [here](https://www.reddit.com/r/2007scape/comments/9t9qin/guide_tears_of_guthix_180_tears_consistently/). If you are not familiar with the optimal stream orders, please visit the link. Some of the comments explain that the optimal order is when the tear streams changein this order: 

green --> green --> green --> blue --> blue --> blue. 

I'll just refer to this order as "gggbbb". We want to figure out which worlds have this order, so the data we will want to collect are stream order and world number. On the server side, we want to keep track of how many people have seen that same order on that world, which will help to give confidence to the data. I will call this piece of data "hits". 

To find the "gggbbb" stream order, I created an event driven Java plugin for RuneLite. The plugin has an algorithm that captures the stream order automatically when players are standing in the minigame area. This is an improvement on the previous method, which required players to manually figure out the stream order for each world, which was an annoying and tedious process (in my opinion). 

One more thing we want to collect is whether a user has already submitted a stream order or not. This is mostly to stop malicious POST requests that serve only to skew the data. For example, we do not want to allow someone using Postman to constantly send false data to our server, making it think that it is receiving a high number of requests for a particular stream order + world number combination. If it did, our database would accumulate a large number of hits for false data, and direct real users to the world with false data, leading to a bad user experience. We cannot stop malicious requests to our server, but we can certainly try to mitigate the extent to which they can skew the data. 

How do we identify unique users and stop them from sending too much false data? I did not want to have to have users create an account and password to use this plugin, because it would have been a hassle for the user. That means the best identifying piece of data would be the user's IP address. We could store the user's IP address along with the world number for which they are sending data, and block any subsequent requests from that user for that world. This makes it a bit harder for someone to skew the data on our server, but does not hamper the experience of real users. 

I know RuneScape users are very cautious when it comes to their IP address (for good reason), so I wanted to be very careful about how I use and store their IPs. I talk about this topic a bit more in the section below that addresses the question, "How do we protect the user's privacy?".


<h3>How do we protect the user's privacy?</h3>

The one piece of data we are collecting that could possibly compromise the user's security is their IP address. It is unlikely that an IP address alone would be enough to cause harm to the user in the event of a leak, but coupled with the fact that we are also storing the user's world number, I can think of some scenarios where the data can be useful to a malicious actor. 

For example, if the IP address of someone is already known and the database of IPs is leaked, they can figure out which worlds they tend to go on. If a user has a "home" world or worlds that they tend to connect to, this information could be found by looking at the aggregated IP address + world data. That information can then be used to more easily find players in game and possibly harass or attack them in PvP areas. 
Users may also connect to certain worlds because of low ping. If this is the case, a malicious actor could deduce a general location of the user with this information. 

These are only the scenarios I can think of, and I am sure there are others. I would prefer to try my best to keep IPs private for the aforementioned reasons, and to give users peace of mind that I do not intend to do anything with the data I collect for my own, or anyone else's personal gain. In truth, probably the biggest reason to protect IP information is that OldSchool Runescape players are extremely security conscious, and I believe they would not be willing to use the plugin if I collected their actual IPs. 

So on to how we try to protect the IPs.

I am using the SHA256 algorithm along with a secret salt stored on the server to hash IP and world information. The code for hashing the IP + world # is found [here](https://github.com/jcarbelbide/tog-crowdsourcing-server/blob/main/src/util.go#L69).

The high level steps are: 
1. Hash the users IP, salted with a private salt stored on the server. This outputs a hash string. 
2. Take the output hash string from the previous step and hash it again, this time salted with the world number. 

This effectively stores the user's IP and world number, so subsequent requests for the same world from the same users can be blocked. To find whether or not a user has already submitted data for that world, we hash the user's data, then check to see if that hash exists on the database. If it does, the request is blocked. 

I understand this isn't the most secure way to store the data, and is still very susceptible to rainbow table attacks, but I am hoping that it will not be worth it to crack if the database ever does get leaked. 

One more layer of security is that the database of user IPs is wiped weekly, and none of the previous week's data is stored anywhere. 

I did look into using the bcrypt library, since it is much more secure and much less susceptible to rainbow table attacks. Unfortunately, for my application, bcrypt would not have worked. This is because bcrypt uses a random salt to hash passwords (in my case I would have hashed IPs). The random salts are much more secure, but because I am not storing a username along with the IP, I do not have a reference to look up. This means that finding out if the user's IP already exists on the database would mean comparing the IP to every single stored IP on the databse to find a match. 
This would become slower as more IPs are added (O(N)). I wanted an O(1) (or near O(1)) lookup so that I don't experience any slowdowns in request handling. 

Normally, with a username + password combo, when a request with a username and password comes in, the username is looked up in the database. The username is associated with a hashed password, which is stored with the random salt. The password from the request is salted with the salt on the database, and if the hashes match, then the user is granted access. 
Now imagine doing this without the username. If we could somehow guarantee that every password in a database is unique, then if a request comes in with a password, we would have to check every single hash+salt in the database until a match is found. This would be very susceptible to DOS attacks because there is so much processing going on. This is especially true for my server, since I am not using a message queue. 

I think my solution strikes a good middle ground between processing time and security. In reality, my lookup is not O(1), but it is O(logn). The hash is a primary key, which means it is indexed and efficient to look up, but it is still a B-Tree structure, that requires O(log n) time to lookup. 

<h3>How do we agregate the data and share it with everyone?</h3>

This was done through an external server. I'm not sure that there is any other way to do this. The external server serves HTTP requests to GET and POST data. That data is stored on a database on the server. 

The RuneLite plugin I created submits a post request to [togcrowdsourcing.com/worldinfo](https://togcrowdsourcing.com/worldinfo) with the collected data. The plugin also has a UI that shows the crowdsourced data that it gets using a GET request to the URL mentioned previously. 

<h3>How do we know when the weekly server reset happens and the collected data must be reset?</h3>

This was probably the most difficult problem I encountered during this entire project. Once a week, the Old School RuneScape servers will reset, and a new optimal world(s) will be randomly selected. Because of this, the data from the week prior becomes outdated, and must be cleared. 

I had a few ideas on how to handle this including:

1. Manually resetting it every week.
2. Scraping the OldSchool RuneScape website for when the weekly update article is pushed out. I would have to identify the weekly article among other articles. 
3. Reset the data when "large amounts" of conflicting data is present on the database. 
4. Establish some sort of connection to the Old School RuneScape servers and check for when that connection is broken. 

Obviously, method 1 is far from ideal. 

Method 2 I felt would have been difficult to get consistent, and still relies on human input (whoever at Jagex (the company) posts the blogpost). 

Method 3 felt a bit hacky to me, and I don't believe it was the idea way to handle this. If I went this route, I would have to define how much a "large amount" of conflicting data meant, and that definition would likely change as the plugin gained more users. It would also be susceptible to trolls. Trolls could reset data if they are able to trick my server into thinking a reset occured. 

Method 4 felt like the "right way" to solve this problem. There seemed to be little downsides to this method, the only I can think of being that the connection could break randomly in the middle of the week. This method was suggested by another more experienced RuneLite developer named [Abex](https://github.com/abextm). He and the other RuneLite developers were incredibly helpful in pointing me in the right direction for this part of the project. 

The solution they suggested was to keep a "JS5" connection with any of the OldSchool RuneScape worlds and ping the connection once in a while. If the connection is broken, the worlds have likely reset. JS5 is a proprietary binary socket protocol developed by Jagex. It is used to download game assets to client PCs. There is no authentication required for the connection, so it is easy to establish. 

By reading some online blogs about the JS5 protocol, asking the other developers about it, and looking at existing code that uses the JS5 connection, I was able to figure out how to establish and keep a connection to the RuneScape servers. 

This method worked out fairly well. The connection is always broken upon a server reset, which is exactly what we want. The only downside is that occasionally, the connection will break for currently unknown reasons, and my backend will reset the database. This does not happen often enough to hamper the user experience too much. Usually, users will find the optimal world fairly quickly, since the plugin automates all of the data collection and data storing. 

I am still looking into whether the servers are actually resetting in the middle of the week, or if it is just the connection that is resetting.

Information about the last time the Old School RuneScape servers restarted can be found at [togcrowdsourcing.com/lastreset](https://togcrowdsourcing.com/lastreset).


<h3>How do we minimize server load and costs?</h3>

Some of the previous sections talk about minimizing server load. This has to do with mostly writing an efficient backend and avoiding expensive processing. I have also placed the server behind CloudFlare to add some protection against malicious attacks, namely DDOS attacks. 

To reduce costs, I am running on a single AWS Lightsail Linux instance, and using Nginx as a reverse proxy to route traffic to my various backends. All of this is running on a single server, so costs are low. Lightsail offers very predictable pricing, and costs have never been more than a few dollars a month. 


<h3>How do we avoid malicious requests to our server?</h3>

This was touched on in the previous sections, but the malicious requests we want to avoid are:

1. DDOS attacks
2. Postman trolls

To mitigate DDOS, I have placed the server behind CloudFlare. 

I am defining a Postman troll as someone who sends POST requests to my server with false data in order to skew the real data. We can't really prevent them from sending malicious requests, but we can reduce the amount of POST requests our backend will process from any one IP, which is what we are doing. 
