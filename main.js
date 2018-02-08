const bot_const = require('./bot_const.json');
const Discord = require('discord.js');
const bot = new Discord.Client();

var isTimerOn = true;
var timerObject = null;
var timerDuration = bot_const.Gen_Timeout;

bot.on('ready', function () {
  console.log("Bot connected on" + " [Get server name]");
})

bot.on('message', message => {
  //console.log(`> message`);
  /*if (message.content === '!stopTimer') {
    console.log("Stoping timer");
    timerStop();
  }*/
  /*if (message.content === '!startTimer') {
    console.log("Sarting timer");
    timerStart();
  }*/
 /* if (message.content === '!ping') {
    message.reply('pong !');
    console.log("Ping pong");
  }
  else */
  /*if (message.content === '!pong') {
    message.reply('ping !');
    console.log("pong Ping ");
  }
  else*/ 
  if (message.content === '!sync') {
    //message.reply('Sync streaming !');
    console.log("> message > !sync > Sync streaming 10 sec delay");
    timerDuration = bot_const.Gen_Timeout;
    syncFunc();
  }
})

bot.on('guildMemberAdd', member => {
  member.createDM().then(channel => {
    return channel.send('Bienvenue sur le serveur SoBad, ' + member.displayName)
  }).catch(console.error)
  // On pourrait catch l'erreur autrement ici (l'utilisateur a peut être désactivé les MP)
})

// Timer functions 
function timerTimeout() {
  //console.log(`> timerTimeout`);
  if(isTimerRunning()) { // timer is ON
    updateRoles();
  }
  else{ // timer is OFF
  }
}
function timerStart() {
  //console.log(`> timerStart`);
  if(isTimerRunning()) { // timer is ON

  }
  else{ // timer is OFF
    console.log(`> timerStart > Timer is now on`);
    timerObject = setInterval(timerTimeout, timerDuration);
  }
}
function timerStop() {
  //console.log(`> timerStop`);
  if(isTimerRunning()) { // timer is ON
    clearInterval(timerObject);
    timerObject = null;   
    console.log(`> timerStop > Timer is now off`); 
  }
  else{ // timer is OFF
  }
}
function isTimerRunning() {
  if(isNullOrUndefined(timerObject))
  {
    return false;
  }
  else{
    return true;
  }
}

// Members and Roles function
function syncFunc(){
  updateRoles();
}
function updateRoles(){
  var botGuilds = bot.guilds;
  botGuilds.forEach(function( guild, snowflake){
    var guildName = guild.name;
    var guildMembers = guild.members;
    var guildRoles = guild.roles;
    updateMembersRoles(guildMembers, guildRoles);
  })
}
function updateMembersRoles(guildMembers, guildRoles){
  var streamingRole = null;
  var streamingRoleFlake = null;
  for(let [snowflake, role] of guildRoles){
    var roleName = role.name;
    if(roleName.includes(bot_const.Stream_Role_Text)){
      //console.log("streamin role found : " + roleName);
      streamingRole = role;   
      streamingRoleFlake = snowflake;    
    }
  }
  // le role de streamin a été trouvé
  // parcourir les membre pour vérifier les streamer et update les roles
  if(!isNullOrUndefined(streamingRole))
  {
    for(let [snowflake, guildMember] of guildMembers){
      if(!isNullOrUndefined(guildMember)){          
        var doRemoveRole = true;
        var displayName = guildMember.displayName;
        var presence = null;
        var game = null;
        //console.log("User is  : " + displayName);
        if(!isNullOrUndefined(guildMember.presence)){
          presence = guildMember.presence;
          if(!isNullOrUndefined(presence.game)){
            game = presence.game;
            // ici le member a une activité
            // on vérifie si l'url contient du twitch
            // si oui on ajoute le role correspondant
            // et on fait en sorte de ne pas supprimer le role
            if(game.streaming){
              doRemoveRole = false;
              addRoleToMemeber(guildMember, streamingRoleFlake, streamingRole);
            }
          }
        }
        // pas de présence
        // ou pas de game en cours
        // ou pas d'url de stream
        if(doRemoveRole)
        {
          removeRoleOfMemeber(guildMember, streamingRoleFlake, streamingRole);
        }
      }
    }
  }
}
function addRoleToMemeber(guildMember, streamingRoleFlake, streamingRole){
  //console.log('> addRoleToMemeber > to ' + guildMember.displayName);
  var game = guildMember.presence.game; // .name .url .streaming
  var memberRoles = guildMember.roles;
  if(memberRoles.has(streamingRoleFlake)){ // a deja le role de streaming
  }
  else{
    console.log('> addRoleToMemeber > ' + guildMember.displayName + ' started streaming on server ' + guildMember.guild.name);
    guildMember.addRole(streamingRole, "Alors on stream");
    var channel = getChannel(guildMember.guild);
    if(channel !== null){
      channel.send(streamStartMsg(guildMember.displayName, game.name, game.url));
    }
  }

}
function removeRoleOfMemeber(guildMember, streamingRoleFlake, streamingRole){
  //console.log('> delRoleOfMemeber > of ' + guildMember.displayName);
  var game = guildMember.presence.game; // .name .url .streaming
  var memberRoles = guildMember.roles;
  if(memberRoles.has(streamingRoleFlake)){
    console.log('> delRoleOfMemeber > ' + guildMember.displayName + ' stopped streaming on server ' + guildMember.guild.name);
    guildMember.removeRole(streamingRole, "Alors on stream plus");
  }
  //else{ // le role n'est pas dans la lsite donc rien a faire
  //}
}
function getChannel(guild){
  if(!isNullOrUndefined(guild))
  {
    if (!isNullOrUndefined(guild.systemChannel))
    {
      return guild.systemChannel;
    }
    else if(!isNullOrUndefined(guild.defaultChannel))
    {
      return guild.defaultChannel;
    }
  }
  return null;
}
function streamStartMsg(userName, gameName, gameUrl){
  return bot_const.Msg_Stream_Text_To +
   "__**" + userName + "**__ " 
  + bot_const.Msg_Stream_Text_Started 
  + "**" + gameName + "**"
  + bot_const.Msg_Stream_Text_End
  + "*" + gameUrl + "*";
}

function isNullOrUndefined(obj){
  return (obj === null || obj === undefined);
}

bot.login(bot_const.BOT_TOKEN_KEY);
timerStart();

