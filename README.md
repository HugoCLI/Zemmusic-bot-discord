All rights reserved - Zemmusic Hugo CLI 2022

# Zemmusic 


> ### All rights reserved, reproduction prohibited
> A third party is not authorized to reproduce, modify or distribute the work without the consent of its author, even if the latter does not mention on its site that any reproduction is prohibited or that all rights are reserved.
> 

 
  
## Have fun, have Zemmusic
Zemmusic simply allows access to fast, modern music with quality sound, it is exclusively reserved for a restricted group of people (at the moment) any use must be authorized by its creator

  
## Installation 
In order to make the robot work, you must install the necessary packages, after downloading, unzip the file (if you have selected the zip option), open a Windows or Linux Terminal and execute the following command

```
npm i
```

Node will automatically take care of installing the packages thanks to the package.json file

After, create a file at the root of the project named `configs.js` then paste the code below and replace the information, the creation of a Discord robot is done from the developer page on [Discord Developer Portal](https://discord.com/developers/applications). You will then find the following information, Customer ID and token.

```js
class configs {
    constructor() {
        let data = {
            token: 'YOUR_TOKEN_BOT_HERE',
            app_id: 'YOUR_USER_ID_BOT_HERE'
        }
        return data;
    }
}
module.exports = configs;
```
  
After that the bot can now be launched thanks to your Terminal (to be executed at the root of the project)

```
node .\index.js 
```

  
## List of usage rights
  
   - ([HugoCLI](https://github.com/HugoCLI)) - 
Unlimited use and modification of the robot, as well as updating its directory ([Zemmusic-bot-discord](https://github.com/HugoCLI/Zemmusic-bot-discord))
