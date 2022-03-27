const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const {Client, Intents, MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const ytdl = require('ytdl-core-discord');
const voice = require('@discordjs/voice');
const chalk = require("chalk");
const audioController = require("./events/audioController");
const errorController = require("./events/errorController");
const errorMessage = new errorController();

const Config = require('./configs');
const config = new Config();

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]});

const rest = new REST({version: '9'}).setToken(config.token);
for (let i = 0; i < 200; i++) console.log(' ');
console.log(chalk.cyan('Starting'));

function uuidv4() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

commands = [{
    name: 'play',
    description: 'Joue de la musique dans un salon audio',
    options: [{
        name: 'rechercher',
        description: 'Entrer une URL',
        type: 3,
        required: true
    }]
}, {
    name: 'skip',
    description: "Musique suivante",
    options: []
},  {
    name: 'next',
    description: "Musique suivante",
    options: []
},  {
    name: 'stop',
    description: "Arrêter la lecture dans le salon audio",
    options: []
}, {
    name: 'volume',
    description: "Régler le volume",
    options: [{
        name: 'valeur',
        description: 'Entre 1 et 100',
        type: 4,
        required: true
    }]
}, {
    name: 'pause',
    description: "Mettre en pause ou continuer la musique",
    options: []
}]
let blacklist = ['758648808535752724', '952582145061322792'];

client.on('ready', (async () => {
    try {
        const Guilds = client.guilds.cache.map(guild => guild.id);
        Guilds.forEach((GuildId) => {
            rest.put(
                Routes.applicationGuildCommands(config.app_id, GuildId),
                { body: commands },
            );
        })

    } catch (error) {
        console.error(error);
    }

    console.log(chalk.green(`${client.user.tag} connecté !`));
    console.log(' ');
    client.user.setActivity('HUM | /play');
}));


let audios = {};
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if(blacklist.includes(interaction.guild.id)) return interaction.reply({content: 'Error : This server is currently blacklisted for non-compliance with security rules. Veuillez contacter un administrateur.'});


    console.log(chalk.magenta('/' + interaction.commandName) + chalk.gray(' executed by ') + chalk.yellow(interaction.user.username) + chalk.gray(' on ') + chalk.cyan(interaction.member.voice.guild.name));
    if (interaction.commandName === 'play') {
        let options = Object.entries(interaction.options);
        if (options[2][1][0].name === 'rechercher' && options[2][1][0].value.length > 3) {
            await interaction.deferReply();
            let value = options[2][1][0].value;

            if (!interaction.member.voice.channel) return await interaction.editReply(errorMessage.get('voice::NotConnectInVoiceChannel'));

            let guildid = interaction.member.voice.channel.guild.id;
            if (!audios[guildid]) audios[guildid] = new audioController(guildid, client);
            let res = await audios[guildid].addQueue({search: value}, interaction);
            if (res && res.toString().startsWith('voice::')) return interaction.editReply(errorMessage.get(res));
        }
    }

    if (interaction.commandName === 'skip' || interaction.commandName === 'next') {
        if (!interaction.member.voice.channel) return await interaction.reply(errorMessage.get('voice::NotConnectInVoiceChannel'));
        await interaction.deferReply();

        let guildid = interaction.member.voice.channel.guild.id;
        if (!audios[guildid]) return await interaction.reply(errorMessage.get('voice::NotHaveMusic'));
        await audios[guildid].skipPlaying(interaction);
    }


    if (interaction.commandName === 'stop') {
        if (!interaction.member.voice.channel) return await interaction.reply(errorMessage.get('voice::NotConnectInVoiceChannel'));
        let guildid = interaction.member.voice.channel.guild.id;
        if (!audios[guildid]) return await interaction.reply(errorMessage.get('voice::NotHaveMusic'));
        audios[guildid].stopPlaying(interaction);

    }


    if (interaction.commandName === 'volume') {

        let options = Object.entries(interaction.options);
        await interaction.deferReply();
        if (!interaction.member.voice.channel !== null) return  await interaction.editReply(errorMessage.get('voice::NotConnectInVoiceChannel'));
        let guildid = interaction.member.voice.channel.guild.id;
        let value = options[2][1][0].value;
        if (!audios[guildid].connection) return await interaction.editReply(errorMessage.get('voice::NotHaveMusic'));
        if(volume < 0 && volume > 100) return await interaction.editReply(errorMessage.get('voice::OutOfRangeVolume'));
        audios[guildid].volume(value, interaction);
    }
});



client.on("guildCreate", guild => {
    try {
        rest.put(
            Routes.applicationGuildCommands(config.app_id, guild.id),
            { body: commands },
        );
    } catch (e) {  }

    console.log(guild.systemChannelId);
            client.channels.fetch(guild.systemChannelId).then( (channel) => {

                const joinembed = new MessageEmbed()
                    .setTitle(`Hey :wave:`)
                    .setDescription(`Je suis ravi de faire votre connaissance ! Je suis Zemmusic, votre opérateur musical. Tu peux découvrir comment utiliser les nouvelles commandes Discord grâce à la vidéo disponible ci-dessous.`)
                    .setColor("#5864ec")
                    .setImage('https://zemmusic.hugochilemme.com/tuto.gif')
                    .addFields(
                        {name: 'Créateur', value: '`Hyugo#8834`', inline: true},
                        {name: 'Commande', value: '`/play <recherche>`', inline: true}
                    );

                channel.send({embeds: [joinembed]})

                if(blacklist.includes(guild.id)) {
                    const joinembed = new MessageEmbed()
                        .setTitle(`Fatal error`)
                        .setDescription(`This server is currently blacklisted for non-compliance with security rules. Veuillez contacter un administrateur. (Code: ${uuidv4()})`)
                        .setColor("#e03c3c")

                    channel.send({embeds: [joinembed]})
                }
            });

});

client.on('guildMemberAdd', member => {
   (member.guild.channels.cache).forEach((elm) => {
       if(elm.name === "general" || elm.name === "général" && elm.type === "GUILD_TEXT") {
           const channel = member.guild.channels.cache.find(channel => channel.name === elm.name)
           if (!channel) return;

           const joinembed = new MessageEmbed()
               .setTitle(`${member.user.username} à rejoint le serveur`)
               .setDescription(`Le serveur compte désormais **${elm.guild.memberCount}** membres.`)
               .setColor("#5864ec")

           channel.send({embeds: [joinembed]})
       }
   })
});


client.login(config.token);