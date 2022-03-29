# Tears of Guthix Crowdsourcing

Thanks for checking out this repo! This particular repo consists of the website component of ToG Crowdsourcing, but I will use it as the central repo to talk about this project and describe the technical challenges that I encountered. 

ToG Crowdsourcing was made to try to help save everyone time during the beginning of the week when servers have reset, and the optimal Tears of Guthix world is unknown. ToG Crowdsourcing will collect data about each world to help all users find the optimal one each week, without having to hop to each world to find it themselves. 

There is a RuneLite plugin (written in Java) that is responsible for collecting the data. That plugin then submits a post request to [togcrowdsourcing.com/worldinfo](https://togcrowdsourcing.com/worldinfo) with the collected data. The plugin also has a UI that shows the crowdsourced data that it gets using a GET request to the URL mentioned previously. The RuneLite plugin can be found at the following repo: [https://github.com/jcarbelbide/tog-crowdsourcing](https://github.com/jcarbelbide/tog-crowdsourcing)

For mobile players or players that do not use RuneLite, the website with the same data can be viewed at [togcrowdsourcing.com](https://togcrowdsourcing.com). 

The backend server that handles the requests can be found at the following repo: [https://github.com/jcarbelbide/tog-crowdsourcing-server](https://github.com/jcarbelbide/tog-crowdsourcing-server). The server is written in Go, utilizes SQLite for the database, and hashes all user related data using SHA256. TODO Finish this section out

Once a week, the Old School RuneScape servers will reset, and a new optimal world(s) will be randomly selected. Because of this, the data from the week prior becomes outdated, and is cleared. The weekly reset is detected through a binary web socket protocol called JS5, which is a proprietary protocol developed by Jagex to download game assets on client PCs. Once the JS5 connection is established, a dummy message is sent every 5 seconds to see when the connection is broken. The connection will not be broken until the servers shut down or restart. Information about the last time the Old School RuneScape servers restarted can be found at [togcrowdsourcing.com/lastreset](https://togcrowdsourcing.com/lastreset). The GitHub repo for this Old School Runescape server monitor can be found at [https://github.com/jcarbelbide/js5-monitor](https://github.com/jcarbelbide/js5-monitor).


An interesting issue I came across when designing the backend was trying to reduce the amount of malicious requests I would get to my server. I did look into using Bcrypt, but since I am not saving any user data that can be used as a key (username or id), it was impractical to store a unique salt with each key. Doing so would have meant that every time TODO finish talking about this
[Code I am referring to with comments to further clarify issue.](https://github.com/jcarbelbide/tog-crowdsourcing-server/blob/main/src/util.go#L51)
