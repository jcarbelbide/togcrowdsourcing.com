# Tears of Guthix Crowdsourcing

Thanks for checking out this repo! This particular repo consists of the website component of ToG Crowdsourcing, but I will use this repo to talk about this project and describe the technical challenges that I encountered. If you would like to visit the live website for this repo, it is found here: https://togcrowdsourcing.com

<h2>Goal of ToG Crowdsourcing</h2>
ToG Crowdsourcing was made to try to help save everyone time finding the optimal Tears of Guthix world. Every week, the Old School Runescape servers reset and the optimal worlds change. ToG Crowdsourcing aims to collect data about each world automatically and share the data to help all users find the optimal worlds each week, without having to hop to each world to find them themselves. 


<h2>Quick Summary of Solution</h2>
Many Old School Runescape players (around 45% of active players) use a third-party client called RuneLite. RuneLite is open source, and allows the community to contribute their own plugins. I have created a plugin for RuneLite that crowdsources the optimal Tears of Guthix world. The plugin sends data to an external server, and the server then shares that data with users. 

<h2>Project Components</h2>
1. RuneLite plugin that collects data. 
2. External Server that agregates data. 
3. Web-app for non-RuneLite or mobile players. 

<h2>Technologies Used</h2>

This project uses the following technologies: 
1. Java - RuneLite is written in Java.
2. Go - The external server code is written in Go.
3. React - Web-app is created with React. 
4. SQLite - Database component. 
5. Nginx - For reverse proxying, setting up an HTTPS connection, and static web-page hosting. 
6. AWS - Server is hosted on a lightsail instance. Lightsail was chosen for its predictable cost. 
7. Cloudflare - Protection from DDOS attacks and other malicious requests. 

<h2>Technical Challenges</h2>

These are some of the technical issues that I encountered:
1. What data do we collect, and how do we collect it? 
2. How do we agregate the data and share it with everyone? 
3. How do we protect the user's privacy?
4. How do we know when the weekly server reset happens and the collected data must be reset? 
5. How do we minimize server load and costs?
6. How do we avoid malicious requests to our server? 

<h2>Project Deep Dive</h2>

<h3>Test</h3>

The RuneLite plugin submits a post request to [togcrowdsourcing.com/worldinfo](https://togcrowdsourcing.com/worldinfo) with the collected data. The plugin also has a UI that shows the crowdsourced data that it gets using a GET request to the URL mentioned previously. The RuneLite plugin can be found at the following repo: [https://github.com/jcarbelbide/tog-crowdsourcing](https://github.com/jcarbelbide/tog-crowdsourcing)

For mobile players or players that do not use RuneLite, the website with the same data can be viewed at [togcrowdsourcing.com](https://togcrowdsourcing.com). 

The backend server that handles the requests can be found at the following repo: [https://github.com/jcarbelbide/tog-crowdsourcing-server](https://github.com/jcarbelbide/tog-crowdsourcing-server). The server is written in Go, utilizes SQLite for the database, and hashes all user related data using SHA256. TODO Finish this section out

Once a week, the Old School RuneScape servers will reset, and a new optimal world(s) will be randomly selected. Because of this, the data from the week prior becomes outdated, and is cleared. The weekly reset is detected through a binary web socket protocol called JS5, which is a proprietary protocol developed by Jagex to download game assets on client PCs. Once the JS5 connection is established, a dummy message is sent every 5 seconds to see when the connection is broken. The connection will not be broken until the servers shut down or restart. Information about the last time the Old School RuneScape servers restarted can be found at [togcrowdsourcing.com/lastreset](https://togcrowdsourcing.com/lastreset). The GitHub repo for this Old School Runescape server monitor can be found at [https://github.com/jcarbelbide/js5-monitor](https://github.com/jcarbelbide/js5-monitor).


An interesting issue I came across when designing the backend was trying to reduce the amount of malicious requests I would get to my server. I did look into using Bcrypt, but since I am not saving any user data that can be used as a key (username or id), it was impractical to store a unique salt with each key. Doing so would have meant that every time TODO finish talking about this
[Code I am referring to with comments to further clarify issue.](https://github.com/jcarbelbide/tog-crowdsourcing-server/blob/main/src/util.go#L51)
