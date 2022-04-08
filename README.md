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

For example, if the IP address of someone is already known, they can figure out which worlds they tend to go on. If a user has a "home" world or worlds that they tend to connect to, this information could be found by looking at the aggregated IP address + world data. Users may also connect to certain worlds because of low ping. If this is the case, a malicious actor could deduce a general location of the user with this information. 

These are only the scenarios I can think of, and I am sure there are others. I would prefer to try my best to keep IPs private for the aforementioned reasons, and to give users peace of mind that I do not intend to do anything with the data I collect for my own, or anyone else's personal gain. 

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

<h3>How do we minimize server load and costs?</h3>

<h3>How do we avoid malicious requests to our server?</h3>






Once a week, the Old School RuneScape servers will reset, and a new optimal world(s) will be randomly selected. Because of this, the data from the week prior becomes outdated, and is cleared. The weekly reset is detected through a binary web socket protocol called JS5, which is a proprietary protocol developed by Jagex to download game assets on client PCs. Once the JS5 connection is established, a dummy message is sent every 5 seconds to see when the connection is broken. The connection will not be broken until the servers shut down or restart. Information about the last time the Old School RuneScape servers restarted can be found at [togcrowdsourcing.com/lastreset](https://togcrowdsourcing.com/lastreset). The GitHub repo for this Old School Runescape server monitor can be found at [https://github.com/jcarbelbide/js5-monitor](https://github.com/jcarbelbide/js5-monitor).


An interesting issue I came across when designing the backend was trying to reduce the amount of malicious requests I would get to my server. I did look into using Bcrypt, but since I am not saving any user data that can be used as a key (username or id), it was impractical to store a unique salt with each key. Doing so would have meant that every time TODO finish talking about this
[Code I am referring to with comments to further clarify issue.](https://github.com/jcarbelbide/tog-crowdsourcing-server/blob/main/src/util.go#L51)
