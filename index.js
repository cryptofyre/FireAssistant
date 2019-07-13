const Discord = require('discord.js');
const bot = new Discord.Client();
const ytdl = require('ytdl-core');
const queue = new Map();
const {
	prefix,
	token,
} = require('./config.json');

bot.on('ready', () =>{
    console.log('Im online and ready to begin listening to your commands!');
})

bot.on('message', message => {
    // Ignore messages that aren't from a guild
    if (!message.guild) return;
  
    // if the message content starts with "!ban"
    if (message.content.startsWith('!ban')) {
      const user = message.mentions.users.first();
      // If we have a user mentioned
      if (user) {
        // Now we get the member from the user
        const member = message.guild.member(user);
        // If the member is in the guild
        if (member) {
          member.ban({
            reason: 'They were bad!',
          }).then(() => {
            message.reply(`Successfully banned ${user.tag}`);
          }).catch(err => {
            message.reply('I was unable to ban the member');
            console.error(err);
          });
        } else {
          // The mentioned user isn't in this guild
          message.reply('That user isn\'t in this guild!');
        }
      } else {
      // Otherwise, if no user was mentioned
        message.reply('You didn\'t mention the user to ban!');
      }
    }
  });

bot.on('message', message => {
    // Ignore messages that aren't from a guild
    if (!message.guild) return;
  
    // If the message content starts with "!kick"
    if (message.content.startsWith('!kick')) {
      const user = message.mentions.users.first();
      // If we have a user mentioned
      if (user) {
        // Now we get the member from the user
        const member = message.guild.member(user);
        // If the member is in the guild
        if (member) {
          /**
           * Kick the member
           * Make sure you run this on a member, not a user!
           * There are big differences between a user and a member
           */
          member.kick('Optional reason that will display in the audit logs').then(() => {
            // We let the message author know we were able to kick the person
            message.reply(`Successfully kicked ${user.tag}`);
          }).catch(err => {
            // An error happened
            // This is generally due to the bot not being able to kick the member,
            // either due to missing permissions or role hierarchy
            message.reply('I was unable to kick the member');
            // Log the error
            console.error(err);
          });
        } else {
          // The mentioned user isn't in this guild
          message.reply('That user isn\'t in this guild!');
        }
      // Otherwise, if no user was mentioned
      } else {
        message.reply('You didn\'t mention the user to kick!');
      }
    }
  });

bot.on('message', msg=>{
    if(msg.content === "assistant!"){
        msg.reply('Im ready! Whats up.')
    }
})

bot.on('message', msg=>{
    if(msg.content === "eyy"){
        msg.reply('Did you mean to say eyy lmao? jk im not a autocorrect bot.')
    }
})

bot.on('message', msg=>{
    if(msg.content === "what do you think of fortnite?"){
        msg.reply('WE DO NOT CONDONE THIS TYPE OF BEHAVIOR!!!')
    }
})

bot.on('message', msg=>{
    if(msg.content === "call 911"){
        msg.reply('Dialing... Hang tight!')
        msg.reply('Hello this is 911 how may I be of service?')
    }
})

bot.on('message', msg=>{
    if(msg.content === "ur gay"){
        msg.reply('no u')
    }
})

bot.on('message', msg=>{
    if(msg.content === "no u"){
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('keep trying and see what happens.')
    }
})

bot.on('message', msg=>{
    if(msg.content === "reverse card"){
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('no u')
        msg.reply('keep trying and see what happens.')
    }
})

bot.on('message', msg=>{
    if(msg.content === "do u like minecraft?"){
        msg.reply('I love it!')
    }
})

bot.on('message', msg=>{
    if(msg.content === "do you like sam?"){
        msg.reply('me and @SamtheSnipingMan#1811 are besties!')
    }
})

bot.on('message', msg=>{
    if(msg.content === "Whats your favorite type of tank?"){
        msg.reply('Have not decided yet.')
    }
})

bot.on('message', msg=>{
    if(msg.content === "What's your favorite type of train?"){
        msg.reply('tEsLa tRaIn')
    }
})

bot.once('ready', () => {
	console.log('Ready!');
});

bot.once('reconnecting', () => {
	console.log('Reconnecting!');
});

bot.once('disconnect', () => {
	console.log('Disconnect!');
});

bot.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	const serverQueue = queue.get(message.guild.id);

	if (message.content.startsWith(`${prefix}play`)) {
		execute(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}skip`)) {
		skip(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}stop`)) {
		stop(message, serverQueue);
		return;
	} else {
		message.channel.send('You need to enter a valid command!')
	}
});

async function execute(message, serverQueue) {
	const args = message.content.split(' ');

	const voiceChannel = message.member.voiceChannel;
	if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('I need the permissions to join and speak in your voice channel!');
	}

	const songInfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songInfo.title,
		url: songInfo.video_url,
	};

	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send(`${song.title} has been added to the queue!`);
	}

}

function skip(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
	if (!serverQueue) return message.channel.send('There is no song that I could skip!');
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', () => {
			console.log('Music ended!');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}


bot.login(token);