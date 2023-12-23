const TelegramApi = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const dialogflow = require('@google-cloud/dialogflow').v2beta1;

const dbPath = './server.db';
const db = new sqlite3.Database(dbPath)
const uuid = require('uuid');

const token = "6038880701:AAEU-qypb7k2SrPH13O2Pn_si46XmHksgfQ"
const payment_token = "410694247:TEST:92a67171-8d9a-4665-806d-008029be1e25"
const bot = new TelegramApi(token, { polling: true })

const admins_id = [1432248216,1300210900];
const credentials = require('./key.json');

const sessionClient = new dialogflow.SessionsClient({ credentials });
const projectId = 'small-talk-rwvf';


/* export default function SendMSg(id,message) {
  bot.sendMessage(id,message);
} */

let lastToId = 0;
const MaxVideocards = [
  250,
  500,
  750,
]

const FarmingTimers = [
  7200,
  3600,
  1800,
] 
const VipRangs = [
  "Отсутствует",
  "Обычный Вип",
  "MEGAVIP",
]

const Multiplies = [
  1,
  2,
  4,
]

const commands = [
  "/start - выводит меню бота.",
  "/cash - выводит состояние вашего счета.",
  "/farming - позволяет заработать деньги.",
  "/rich_top - выводит топ 10 самых богатых пользователей.",
  "/ping - выводит задержку бота.",
  "/shop - выводит магазин.",
  "/profile - показывает профиль (писать ответом).",
  "/clans - покажет топ богатых кланов.",
  "/give_c - передать деньги пользователю (писать ответом).",
  "/give_v - передать видеокарты пользователю (писать ответом).",
  "/post_sub - отписаться/подписаться на рассылку из канала.",
  "/code {код} - превратит кучку текста в красивый дизайн с кодом."
]

const Clans = [
  "отсутствует"
]


function CheckAdmin(message) {
  let admin = admins_id.includes(message.from.id) ? true:false
  return admin
}



function CheckAccount(row,message) {
  if (row == undefined) {
    db.run("INSERT INTO users (id, mention, name, cash, last_farming_time, isVIP, farmLimit, videocards, viruses, stopFarm, attacker, clan, goldfevervalue, mention, posting) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [message.from.id, "", message.from.first_name, 20000, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    bot.sendMessage(message.chat.id,"😊Ты автоматически зарегистрирован(а)! \nУдачи в использовании!",{reply_to_message_id: message.message_id});
    return true;
  }
}

function FormatTime(seconds) {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  var remainingSeconds = seconds % 60;

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  remainingSeconds = (remainingSeconds < 10) ? "0" + remainingSeconds : remainingSeconds;

  return hours + ":" + minutes + ":" + remainingSeconds;
}
function FormatNum(num) {
  try {
    return num.toLocaleString('en-US', { minimumFractionDigits: 1 });
  } catch (error) {
    return num
  }

    
}

function createProcess(user_id, msg) {
  const name = msg.text;
  
  if (name.length <= 25) {
    db.run('UPDATE users SET cash = cash - ?, clan = ? WHERE id = ?', [20000000, name, user_id], (err) => {
      if (err) {
        console.error(err);
        return;
      }
      
      db.run('INSERT INTO clans (name, money, tanks, artillery, owner, points, shield, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [name, 20000000, 0, 0, user_id, 0, 0, 0], (err) => {
        if (err) {
          console.error(err);
          return;
        }
        bot.sendMessage(msg.chat.id, `✅ Регистрация клана успешна! \n🧾Название клана: ${name}\n💰Баланс клана: 20М$`);
      });
    });
  } else {
    bot.sendMessage(msg.chat.id, '❌ Слишком длинное название! (макс. 25 символов)');
  }
}



bot.on("channel_post", async post => {
  if (post.chat.id !== -1001643266914) { return; }

  db.all("SELECT id, posting FROM users", async (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    const messageIdToForward = post.message_id;
    bot.forwardMessage( -1001311536914,-1001643266914, messageIdToForward);
    rows.forEach(row => {
      const userId = row.id;
      

      if (messageIdToForward) {
        if (row.posting == 0) {
          console.log(`Пользователь ${row.id} не подписан на рассылку.`);
        } else {
          bot.forwardMessage(userId, -1001643266914, messageIdToForward)
            .then(() => {
              
            })
            .catch(error => {
              console.error(`Ошибка при пересылке сообщения пользователю с ID ${userId}: ${error.message}`);
              db.run("UPDATE users SET posting = ? WHERE id=?",["0",userId])
            });
        }
      } else {
        console.log('Сообщение для пересылки не найдено.');
      }
    });
  });
});




//ОБРАБОТКА КОМАНД
bot.on("message", async message => {
  if (!message.text) {return}

    const user_id = message.from.id
    const user_name = message.from.first_name
    const user = message.from.username
    const profile_link = `<a href="tg://user?id=${user_id}">${user_name}</a>`
    const NewsChatId = -1001643266914

    //if (message.chat.id != -1001916437129) {
    // return
    //}

    
    if (message.from.username) {
      db.run("UPDATE users SET mention = ? WHERE id=?",[message.from.username,user_id])
    }else {
      db.run("UPDATE users SET mention = ? WHERE id=?",["",user_id])
    }
    try {
      if (message.text.toLowerCase() == "убить") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `🪓 | ${user_name} убил(а) ${message.reply_to_message.from.first_name} ножом в сердце.`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "изнасиловать") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `🥵 | ${user_name} изнасиловал(а) ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "застрелить") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `🔫 | ${user_name} застрелил(а) с пистолета ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "ударить") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `👊 | ${user_name} ударил(а) в челюсть ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "расчленить") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `🔪 | ${user_name} расчленил(а) ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "обнять") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `🤗 | ${user_name} обнял(а) ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "пожать руку") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `🤝 | ${user_name} крепко пожал(а) руку ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "поддержать") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `✊ | ${user_name} морально поддержал(а) ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "поцеловать") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `😘 | ${user_name} поцеловал(а) ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "съесть") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `😋 | ${user_name} съел(а) заживо ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "продать") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `🤑 | ${user_name} продал(а) арабам ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "прописать двоечку") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `🦶 | ${user_name} прописал(а) двоечку ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "наорать") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `🗣 | ${user_name} наорал(а) на ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "переехать") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `🚜 | ${user_name} переехал(а) на тракторе ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "взорвать") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `💣 | ${user_name} взорвал(а) ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "побрить") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `🪒 | ${user_name} побрил(а) налысо ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      else if (message.text.toLowerCase() == "пригласить на танец") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
      
        await bot.sendMessage(message.chat.id, `💃🕺 | ${user_name} пригласил(а) на танец ${message.reply_to_message.from.first_name}`, { reply_to_message_id: message.message_id })
        return;
      }
      

    } catch (error) {
      
    }

    if (message.reply_to_message && message.reply_to_message.from.username === 'eventshol_bot') {
      const sessionId = uuid.v4();
      const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: message.text,
            languageCode: 'ru-RU',
          },
        },
      };
    
      try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
    
        // Проверка на пустой ответ
        if (result.fulfillmentText.trim() === '') {
          return
        } else {
          bot.sendMessage(message.chat.id, result.fulfillmentText, { reply_to_message_id: message.message_id, parse_mode: 'HTML' });
        }
      } catch (error) {
        bot.sendMessage(message.chat.id, 'Что?', { reply_to_message_id: message.message_id, parse_mode: 'HTML' });
      }
    }
    else if (message.text == "/cash" || message.text == "/cash@eventshol_bot" || message.text.toLowerCase() == "баланс") {
      try {
        db.get("SELECT cash, goldfevervalue FROM users WHERE id=?", user_id, async (err, row) => {
          if (CheckAccount(row,message)) {return}

          await bot.sendMessage(message.chat.id, "💰У тебя на счету: " + FormatNum(row.cash) + "$\n⚒Заработай больше с помощью команды /farming",{reply_to_message_id: message.message_id})
        });
      } catch (error) {
        await bot.sendMessage(message.chat.id,"❌ Произошла ошибка!")
      }
    }

    else if (message.text == "/farming"  || message.text == "/farming@eventshol_bot" || message.text.toLowerCase() == "фарм") {
      try {
        db.get("SELECT isVIP,videocards,last_farming_time FROM users WHERE id=?", user_id, async (err, row) => {
          if (CheckAccount(row,message)) {return}
  
          const isVIP = VipRangs[row.isVIP];
          const videocards = row.videocards;

          const lastFarmingTime = row.last_farming_time;
          const timeNow = Math.floor(Date.now() / 1000);
  
          if (timeNow - lastFarmingTime < FarmingTimers[row.isVIP]) {
            let TimeToUse = FarmingTimers[row.isVIP] - (timeNow - lastFarmingTime);
            bot.sendMessage(message.chat.id, "💸 Ты уже собирал доход с майнинг фермы \n⏳Приходи через " + FormatTime(TimeToUse), { reply_to_message_id: message.message_id });
            return;
          }
  
          let randomCash = Math.floor(Math.random() * 9000) + 1000;
          randomCash *= Multiplies[row.isVIP];
          randomCash *= videocards > 1? (videocards):(1);
  
          let multiplyText = Multiplies[row.isVIP] * videocards;
          let textVideo = videocards > 1 ? videocards:'Нету. \n💠Используется встроенное графическое ядро.' 

          await bot.sendMessage(message.chat.id, "💰Ты получил(а): " + FormatNum(randomCash) + "$ с дохода майнинга!\n\n⭐️ Твой VIP: " + isVIP + "\n📼 Видеокарты: "+textVideo+"\n✖️ Множитель: " + multiplyText, { reply_to_message_id: message.message_id });
          console.log(`${message.from.first_name} - ${timeNow}, Link - 'https://t.me/@id${message.from.id}'`)
          db.run('UPDATE users SET last_farming_time = ?,cash = cash + ? WHERE id = ?', [timeNow, randomCash,user_id]);
        });
      } catch (error) {
        await bot.sendMessage(message.chat.id,"❌ Произошла ошибка!")
      }
    }

    else if (message.text == "/ping"  || message.text == "/ping@eventshol_bot" || message.text.toLowerCase() == "пинг") {
      const start_time = Date.now();
      await bot.sendMessage(message.chat.id, 'Pinging...', { reply_to_message_id: message.message_id }).then(reply => {
        const end_time = Date.now();
        const ping_time = (end_time - start_time).toFixed(2); // Задержка в миллисекундах
        bot.editMessageText(`Pong! Задержка: ${ping_time} ms`, { chat_id: message.chat.id, message_id: reply.message_id });
      }).catch(error => {
        console.error('Ошибка при отправке сообщения:', error.message);
      });
    }

    // else if (message.text == "/gold_top"  || message.text == "/gold_top@eventshol_bot" || message.text.toLowerCase() == "топ ивента") {
    //   let msg = "🤑Топ-5 лидера золотой лихорадки:\n"
    //   let index = 0
    //   db.each("SELECT Name name,goldFeverValue goldfevervalue FROM users ORDER BY -goldFeverValue LIMIT 5", [], (err, row) => {
    //     index++
    //     msg = msg + "\n"+index+ ") " + row.name + " - " + String(FormatNum(row.goldfevervalue)) + "$"
    //   }, async () => {
    //     await bot.sendMessage(message.chat.id, msg, { parse_mode: 'HTML', reply_to_message_id: message.message_id })
    //   })
    // }

    else if (message.text == "/rich_top"  || message.text == "/rich_top@eventshol_bot" || message.text.toLowerCase() == "топ богачей") {
      let msg = "🤑Топ-10 самых богатых пользователей бота:\n"
      let index = 0
      db.each("SELECT Cash cash,Name name, Id id FROM users ORDER BY -Cash LIMIT 10", [], (err, row) => {
        index++
        msg = msg + `\n ${index}) <a href='tg://user?id=${row.id}'>${row.name}</a> - <code>${String(FormatNum(row.cash))}$</code>`
      }, async () => {
        await bot.sendMessage(message.chat.id, msg, { parse_mode: "HTML", reply_to_message_id: message.message_id, disable_notification: true})
      })
    }

    else if (message.text == "/start"  || message.text == "/start@eventshol_bot" || message.text.toLowerCase() == "старт") {
      try {
        await bot.sendMessage(message.chat.id,'Привет, '+user_name+'! Чем могу помочь?',{reply_to_message_id: message.message_id,reply_markup: 
          JSON.stringify({
            inline_keyboard: [
              [{ text: '📲Команды', callback_data: '/start.commands' }, { text: '👾РП-команды', url: 'https://t.me/eventbotlive/78' }],
              [{ text: '➕Добавить бота в группу', url: 'https://t.me/eventshol_bot?startgroup=true' }],
              [{ text: '📣Канал бота', url: 'https://t.me/eventshol_live' }],
              [{ text: '💬Группа бота', url: 'https://t.me/eventshol_chat' }]

            ]
          }
        )})
        

      } catch (error) {
        console.log(error)
        bot.sendMessage(message.chat.id,"❌ Произошла ошибка! \nEсли Вы заблокировали бота, пожалуйста, разблокируйте его.")
      }
    }

    else if (message.text == "/shop"  || message.text == "/shop@eventshol_bot" || message.text.toLowerCase() == "магазин") {
      try {
        await bot.sendMessage(message.chat.id,'Магазин! Что вы хотите купить?',{reply_to_message_id: message.message_id,reply_markup: 
          JSON.stringify({
            inline_keyboard: [
              [{ text: '📼 1 Видеокарта - 50К$', callback_data: '/shop.1Videocard'}],
              [{ text: '📼 50 Видеокарт  - 2,5М$', callback_data: '/shop.50Videocard' }],
              [{ text: '📼 100 Видеокарт  - 5М$', callback_data: '/shop.100Videocard' }],

              [{ text: '⭐️VIP - 1М$', callback_data: '/shop.vip',},{ text: '🌟MEGAVIP - 50М$', callback_data: '/shop.megavip' }],
            ]
          }
        )})


      } catch (error) {
        bot.sendMessage(message.chat.id,"❌ Произошла ошибка! \nEсли Вы заблокировали бота, пожалуйста, разблокируйте его.", {reply_to_message_id: message.message_id })
      }
    }

    try {
      if (message.text.slice(0,7) == "/give_c") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
        
        db.get("SELECT cash FROM users WHERE id=?",[message.reply_to_message.from.id], async (err,rowr) => {
         
          if (rowr == undefined) {
            bot.sendMessage(message.chat.id, "У этого пользователя нет аккаунта!", { reply_to_message_id: message.message_id })
          }else {
            db.get("SELECT cash FROM users WHERE id=?",[user_id], async (err,rows) => {
              
              if (CheckAccount(rows,message)) {return}
            
    
            if (user_id == message.reply_to_message.from.id) {
              bot.sendMessage(message.chat.id, "Нельзя отправить деньги самому себе!", { reply_to_message_id: message.message_id })
              return
            }
    
            if (message.reply_to_message.from.is_bot) {
              bot.sendMessage(message.chat.id, "Нельзя отправить деньги боту!", { reply_to_message_id: message.message_id })
              return
            }
            
            let CashToGive = message.text.split(" ")[1]
            try {
              if (Number.isNaN(Number(CashToGive))) {return}
            }
            catch (error) {
              console.error(error)
              bot.sendMessage(message.chat.id, "Данное значение не является полностью числовым!", { reply_to_message_id: message.message_id })
              return
            }
            if (Number.isInteger(Number(CashToGive)) == false) {
              bot.sendMessage(message.chat.id, "Нельзя отправить дробное число!", { reply_to_message_id: message.message_id })
              return
            }
            if (parseInt(CashToGive)<= 0) {
              bot.sendMessage(message.chat.id, "Нельзя отправить число меньше или равное нулю!", { reply_to_message_id: message.message_id })
              return
            } 
            if ((rows.cash - CashToGive) < 0) {
              CashToGive = rows.cash
            }
            db.run('UPDATE users SET cash = cash - ? WHERE id = ?',[CashToGive, user_id])
            db.run('UPDATE users SET cash = cash + ? WHERE id = ?',[CashToGive, message.reply_to_message.from.id])
      
            await bot.sendMessage(message.chat.id, 'Успешно отправлено ' + FormatNum(CashToGive) + "$ пользователю " + message.reply_to_message.from.first_name, { reply_to_message_id: message.message_id });
          })}
        })
      }
      else if (message.text.slice(0,7) == "/give_v") {
        if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
        db.get("SELECT videocards, isVIP FROM users WHERE id=?",[message.reply_to_message.from.id], async (err,rowr) => {
          if (rowr == undefined) {
            bot.sendMessage(message.chat.id, "У этого пользователя нет аккаунта!", { reply_to_message_id: message.message_id })
          }else {
            db.get("SELECT videocards FROM users WHERE id=?",[user_id], async (err,rows) => {
              if (CheckAccount(rows,message)) {return}
           
    
            if (user_id == message.reply_to_message.from.id) {
              bot.sendMessage(message.chat.id, "Нельзя отправить видеокарты самому себе!", { reply_to_message_id: message.message_id })
              return
            }
    
            if (message.reply_to_message.from.is_bot) {
              bot.sendMessage(message.chat.id, "Нельзя отправить видеокарты боту!", { reply_to_message_id: message.message_id })
              return
            }

            if (message.reply_to_message.from.is_bot) {
              bot.sendMessage(message.chat.id, "Нельзя отправить видеокарты боту!", { reply_to_message_id: message.message_id })
              return
            }            
            



            let VideoToGive = message.text.split(" ")[1]
            try {
              if (Number.isNaN(Number(VideoToGive))) {return}
            }
            catch (error) {
              console.error(error)
              bot.sendMessage(message.chat.id, "Данное значение не является полностью числовым!", { reply_to_message_id: message.message_id })
              return
            }


            
            const user_vip = MaxVideocards[rowr.isVIP]
            if (VideoToGive <= 0) {
              bot.sendMessage(message.chat.id, "Нельзя отправить число меньше или равное нулю!", { reply_to_message_id: message.message_id })
              return
            }
            if (Number.isInteger(Number(VideoToGive)) == false) {
              bot.sendMessage(message.chat.id, "Нельзя отправить дробное число!", { reply_to_message_id: message.message_id })
              return
            }
            if ((VideoToGive + rowr.videocards) >= user_vip) {
              bot.sendMessage(message.chat.id, "Нельзя отправить видеокарты этому пользователю! У него будет превышен лимит.", { reply_to_message_id: message.message_id })
              return
            }
            if ((rows.videocards - VideoToGive) < 0) {
              VideoToGive = rows.videocards
            }
            db.run('UPDATE users SET videocards = videocards - ? WHERE id = ?',[VideoToGive, user_id])
            db.run('UPDATE users SET videocards = videocards + ? WHERE id = ?',[VideoToGive, message.reply_to_message.from.id])
      
            await bot.sendMessage(message.chat.id, 'Успешно отправлено ' + FormatNum(VideoToGive) + " видеокарт пользователю " + message.reply_to_message.from.first_name, { reply_to_message_id: message.message_id });
           })}
        })
      }


      else if (message.text.slice(0,8) == "/profile"  || message.text.slice(0,22) == "/profile@eventshol_bot") {
        
        let current_clan;
        let profile_text = "Ошибка"
        if (message.entities[1]) {
          const entity = message.entities[1]
          if (entity.type == "mention") {
            const CurentUser = message.text.slice(entity.offset + 1,entity.offset + entity.length)
            db.get("SELECT name, id, cash, isVIP, videocards, clan FROM users WHERE mention=?", CurentUser, async (err, row) => {
 
              if (row == undefined) { await bot.sendMessage(message.chat.id, "✖️У отмеченного юзера нет аккаунта, или юзернейма", { reply_to_message_id: message.message_id });;return}
                           
              if (row.clan === '0'){
                lastToId = row.id
                current_clan = 'нет'
                profile_text = `👤 Информация о пользователе @${CurentUser}: \n🪪 Имя: ${row.name} \n🆔 ID: ${row.id} \n💵 Деньги: ${FormatNum(row.cash)}$ \n⭐️ VIP: ${VipRangs[row.isVIP]} \n📼 Видеокарты: ${row.videocards}\n🏰 Клан: ${current_clan}`;
                await bot.sendMessage(message.chat.id, profile_text, { parse_mode: 'HTML', reply_to_message_id: message.message_id, reply_markup:           JSON.stringify({
                  inline_keyboard: [
                    [{ text: '✉️Пригласить в клан', callback_data: 'invite'}],
                  ]
                }
              )}); 
              return
              } else {
                current_clan = row.clan
                profile_text = `👤 Информация о пользователе @${CurentUser}: \n🪪 Имя: ${row.name} \n🆔 ID: ${row.id} \n💵 Деньги: ${FormatNum(row.cash)}$ \n⭐️ VIP: ${VipRangs[row.isVIP]} \n📼 Видеокарты: ${row.videocards}\n🏰 Клан: ${current_clan}`;
                await bot.sendMessage(message.chat.id, profile_text, { parse_mode: 'HTML', reply_to_message_id: message.message_id });
              }
              
              
            });
          } return
        
        }else {
          if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
          db.get("SELECT name, id, cash, isVIP, videocards, clan FROM users WHERE id=?", message.reply_to_message.from.id, async (err, row) => {
            
            if (row == undefined) { await bot.sendMessage(message.chat.id, "✖️У этого пользователя нет аккаунта!", { reply_to_message_id: message.message_id });return}
                     
            let profile_text = `👤 Информация о пользователе <a href='tg://user?id=${row.id}'>${message.reply_to_message.from.first_name}</a>: \n🪪 Имя: ${row.name} \n🆔 ID: ${row.id} \n💵 Деньги: ${FormatNum(row.cash)}$ \n⭐️ VIP: ${VipRangs[row.isVIP]} \n📼 Видеокарты: ${row.videocards}\n🏰 Клан: ${current_clan}`;
            if (row.clan === '0'){
              lastToId = row.id
              current_clan = 'нет' 
              profile_text = `👤 Информация о пользователе <a href='tg://user?id=${row.id}'>${message.reply_to_message.from.first_name}</a>: \n🪪 Имя: ${row.name} \n🆔 ID: ${row.id} \n💵 Деньги: ${FormatNum(row.cash)}$ \n⭐️ VIP: ${VipRangs[row.isVIP]} \n📼 Видеокарты: ${row.videocards}\n🏰 Клан: ${current_clan}`;
              await bot.sendMessage(message.chat.id, profile_text, { reply_to_message_id: message.message_id, parse_mode: 'HTML', reply_markup:           JSON.stringify({
                inline_keyboard: [
                  [{ text: '✉️Пригласить в клан', callback_data: 'invite'}],
                ]
              }
            )}); 
            return
            
            } else {
              current_clan = row.clan
              profile_text = `👤 Информация о пользователе ${message.reply_to_message.from.first_name}: \n🪪 Имя: ${row.name} \n🆔 ID: ${row.id} \n💵 Деньги: ${FormatNum(row.cash)}$ \n⭐️ VIP: ${VipRangs[row.isVIP]} \n📼 Видеокарты: ${row.videocards}\n🏰 Клан: ${current_clan}`;
              await bot.sendMessage(message.chat.id, profile_text, { parse_mode: 'HTML', reply_to_message_id: message.message_id });
            }
            });
            return
        } 
      } else if (message.text == "/clans" || message.text.toLowerCase() == "кланы") {
        try {let msg = "🤑Топ-10 самых богатых кланов:\n"
        let index = 0
        db.each("SELECT Name name, Money money FROM clans ORDER BY -money LIMIT 10", [], (err, row) => {
          index++
          msg = `${msg} \n<code>${index}) ${row.name} - ${String(FormatNum(row.money))}$</code>`
        }, async () => {
          await bot.sendMessage(message.chat.id, msg, { reply_to_message_id: message.message_id, parse_mode: "HTML", reply_markup:
          JSON.stringify({
            inline_keyboard: [
              [{ text: '➕Создать клан за 20М$', callback_data: 'create'}],
            ]
          }
        ) })
        })} catch (error){
          console.log(error)
        }

      }
      else if (message.text.slice(0,5) == "/code" || message.text.toLowerCase() == "код") {
        try {
          var code = message.text.slice(6);
          bot.sendMessage(message.chat.id, `<pre>${code}</pre> \n<`, {reply_to_message_id: message.message_id, parse_mode: "HTML"})
        } catch (error){
          console.log(error)
          bot.sendMessage(message.chat.id, "Ошибка!", {reply_to_message_id: message.message_id })
        }

      }
      else if (message.text.slice(0,5) == "/echo") {
        try {
          var code = message.text.slice(6);
          console.log(message)
        } catch (error){
          console.log(error)
          bot.sendMessage(message.chat.id, "Ошибка!", {reply_to_message_id: message.message_id })
        }

      }
      else if (message.text.slice(0,9) == "/post_sub" || message.text.toLowerCase() == "подписка" || message.text.toLowerCase() == "рассылка") {
        try {
          db.get("SELECT posting FROM users WHERE id=?", message.from.id, async (err, row) => {
            if (row.posting == 0){
              db.run("UPDATE users SET posting = ? WHERE id = ?", [1, message.from.id])
              bot.sendMessage(message.chat.id, "Вы успешно подписались на рассылку из канала @eventshol_live! \nДля отключения подписки повторно введите /post_sub.", {reply_to_message: message.message_id});
            }
            else {
              db.run("UPDATE users SET posting = ? WHERE id = ?", [0, message.from.id])
              bot.sendMessage(message.chat.id, "Вы успешно отписались от рассылки из канала @eventshol_live! \nДля активации подписки повторно введите /post_sub.", {reply_to_message: message.message_id});
            }
          }); 
          
        } catch (error){
          console.log(error)
          bot.sendMessage(message.chat.id, "Ошибка!", {reply_to_message_id: message.message_id })
        }

      }
      else if (message.text.slice(0,6) == "/vip" || message.text.toLowerCase() == "вип") {
        const vips = [
          `┌ Без VIP'а:\n├─ Лимит ${MaxVideocards[0]} видеокарт\n├─ Время до след. добычи ${FarmingTimers[0]/180} часа\n└─ ${Multiplies[0]}x множитель добытых денег`,

          `┌ ${VipRangs[1]}:\n├─ Лимит ${MaxVideocards[1]} видеокарт\n─ Время до след. добычи ${FarmingTimers[1]/180} час\n└─ ${Multiplies[1]}x множитель добытых денег`,

          
          `┌ ${VipRangs[2]}:\n├─ Лимит ${MaxVideocards[2]} видеокарт\n├─ Время до след. добычи ${FarmingTimers[2]/180} минут\n└─ ${Multiplies[2]}x множитель добытых денег`
        ]
        try {
          db.get("SELECT isVIP FROM users WHERE id=?", message.from.id, async (err, row) => {
            bot.sendMessage(message.chat.id, `Твой VIP: ${VipRangs[row.isVIP]}! \n\nВозможности VIP: <code>\n${vips[0]} \n\n${vips[1]} \n\n${vips[2]}</code>`, {reply_to_message_id: message.message_id, parse_mode: 'HTML' })
          }); 
          
        } catch (error){
          console.log(error)
          bot.sendMessage(message.chat.id, "Ошибка!", {reply_to_message_id: message.message_id })
        }

      }
      else if (message.text.slice(0,6) == "/donate" || message.text.toLowerCase() == "донат") {
        try {
          bot.sendInvoice(message.chat.id, )
        } catch (error){
          console.log(error)
          bot.sendMessage(message.chat.id, "Ошибка!", {reply_to_message_id: message.message_id })
        }

      }

    } catch (error) {
      console.log(error)
    }

    ///// АДМИН КОМАНДЫ /////
    try {
      if (message.text.slice(0,5) == "/sudo") {
        if (!CheckAdmin(message)) {await bot.sendMessage(message.chat.id,"Ты не являешься администратором бота!", {reply_to_message_id: message.message_id });return}
        
        try {
          let args = message.text.slice(5) 

          try {
            if (args.slice(0,5) == ".cash") {
              if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
              try {
                let sum

                if (args.slice(6,7) == "=") {

                  try {
                    sum = Number(args.slice(8))
                  } catch (error) {
                    console.log(error);
                  }
                  db.run('UPDATE users SET cash = ? WHERE id = ?', [sum,message.reply_to_message.from.id]);
                }
                else if (args.slice(6,7) == "-") {
                  try {
                    sum = Number(args.slice(8))
                  } catch (error) {
                    console.log(error);
                  }
                  db.run('UPDATE users SET cash = cash - ? WHERE id = ?', [sum,message.reply_to_message.from.id]);
                }
                else if (args.slice(6,7) == "+") {
                  try {
                    sum = Number(args.slice(8))
                  } catch (error) {
                    console.log(error);
                  }
                  db.run('UPDATE users SET cash = cash + ? WHERE id = ?', [sum,message.reply_to_message.from.id]);
                }
                else {
                  await bot.sendMessage(message.chat.id,"Математический оператор не существует либо не поддерживается!", {reply_to_message_id: message.message_id })
                }
              } catch (error) {
                
              }
              
            } 
            else if (args.slice(0,11) == ".videocards") {
              if (!message.reply_to_message) {await bot.sendMessage(message.chat.id,"Команда должна писаться в ответ на сообщение! ", {reply_to_message_id: message.message_id });return}
              try {
                let sum

                if (args.slice(12,13) == "=") {

                  try {
                    sum = Number(args.slice(14))
                  } catch (error) {
                  }

                  db.run('UPDATE users SET videocards = ? WHERE id = ?', [sum,message.reply_to_message.from.id]);
                }
                else if (args.slice(12,13) == "-") {
                  try {
                    sum = Number(args.slice(14))
                  } catch (error) {
                  }
                  db.run('UPDATE users SET videocards = videocards - ? WHERE id = ?', [sum,message.reply_to_message.from.id]);
                }
                else if (args.slice(12,13) == "+") {
                  try {
                    sum = Number(args.slice(14))
                  } catch (error) {
                  }
                  db.run('UPDATE users SET videocards = videocards + ? WHERE id = ?', [sum,message.reply_to_message.from.id]);
                }
                else { 
                  await bot.sendMessage(message.chat.id,"Математический оператор не существует либо не поддерживается!", {reply_to_message_id: message.message_id })
                }
              } catch (error) {
                
              }
              
            } else if (args.slice(0,4) == ".say") {
              try {
                text = args.slice(5)
              } catch (error) {

              }
              if (message.reply_to_message) 
              {
                bot.sendMessage(message.chat.id, text, {reply_to_message_id: message.reply_to_message.message_id, parse_mode: 'HTML' })
                bot.deleteMessage(message.chat.id, message.message_id)
                return
              } else {
                bot.sendMessage(message.chat.id, text, { parse_mode: 'HTML' })
                bot.deleteMessage(message.chat.id, message.message_id)
                return
              }
            
            }
            else if (args.slice(0, 5) == ".send") {
              try {
                const words = message.text.split(" ");
                const id = words[1];
                const text = words.slice(2).join(" ");
                bot.sendMessage(id, text, { parse_mode: "HTML" });
                bot.sendMessage(message.chat.id, `Успешно отправлено пользователю с ID ${id}!`);
              } catch (error) {
                if (error.message.includes("Chat not found")) {
                bot.sendMessage(message.chat.id, "Такого ID не существует!");
                return;
              } else {
                
              }
              }
              }

              else if (args.slice(0, 11) == ".event.stop") {
                try {
                  db.run('UPDATE users SET posting = 1');
                  bot.sendMessage(message.chat.id, "Успешно!")
                } catch (error) {
                  console.log(error);
                }
                }
              
                else if (args.slice(0, 7) == ".groups") {
                const chats = await bot.getChats();

                // Отправляем ответ пользователю
                await bot.sendMessage(msg.chat.id, `Вот список групп, в которых я состою: ${chats.filter((chat) => chat.type === "group").map((chat) => chat.title).join("\n")}`);
              }
            else {
              await bot.sendMessage(message.chat.id,"Неизвестная подкоманда", {reply_to_message_id: message.message_id })
            }
          } catch (error) {
            console.log(error)
          }
        } 
        
        catch (error) {
          await bot.sendMessage(message.chat.id,"Аргументы не указаны!", {reply_to_message_id: message.message_id })
        }
      }else if (message.text.slice(0,6) == ".leave") {
        try {
          const words = message.text.split(" ");
          const id = words[1];
          await bot.leaveChat(id);
      
          bot.sendMessage(message.chat.id, `Я вышел из группы ${id}!`);
        } catch (error) {
          console.log(error)
        }

      }else{
        if (message.chat.type == 'private' && message.text.slice(0,1) != '/'){
          bot.sendMessage(admins_id[0], `Новое сообщение от ${profile_link} (<code>${user_id}</code>):\n${message.text}`, { parse_mode:"HTML" })
        }else{
          
        }
      }
      
    } catch (error) {
    }
})




//ОБРАБОТКА КНОПОК 
bot.on('callback_query', async (callbackQuery) => {
  try {
  const call = callbackQuery;
  const msg = call.message;
  const user_id = call.from.id
  const profile_link = `<a href='tg://user?id=${user_id}'> ${call.from.first_name} </a>`
  
  if (call.data == '/start.commands') {
    let text = `${profile_link} вызвал список команд:\n`;
    commands.forEach((command) => {
      text+= "\n" + command
    })
    await bot.sendMessage(msg.chat.id, `<i>${text}</i>`, { reply_to_message_id: msg.message_id, parse_mode: "HTML" });
  }  
  
  else if (call.data == '/shop.1Videocard') {
    db.get("SELECT videocards,isVIP,cash FROM users WHERE id = ?", [user_id], async (err, row) => {
      if (row == undefined){bot.sendMessage(msg.chat.id, `❗️ ${profile_link}, у тебя нет аккаунта!\nНапиши любую команду, чтобы зарегистрироваться.`);return}
      let canBuy = row.cash > 50000 && row.videocards + 1 <= MaxVideocards[row.isVIP];
  
      if (canBuy) {
        db.run('UPDATE users SET videocards = videocards + 1, cash = cash - 50000 WHERE id = ?', [user_id]);
        await bot.sendMessage(msg.chat.id, callbackQuery.from.first_name +" ты успешно купил 1 видеокарту!",{ reply_to_message_id: msg.message_id });
        return;
      }
      await bot.sendMessage(msg.chat.id, callbackQuery.from.first_name + ", ты не можешь купить 1 видеокарту! \nУ тебя будет превышен лимит либо у тебя недостаточно денег.",{ reply_to_message_id: msg.message_id });
    });
  
  }else if (call.data == '/shop.50Videocard') {
    db.get("SELECT videocards,isVIP,cash FROM users WHERE id = ?", [user_id], async (err, row) => {
      if (row == undefined){bot.sendMessage(msg.chat.id, `❗️ ${profile_link}, у тебя нет аккаунта!\nНапиши любую команду, чтобы зарегистрироваться.`);return}
      let canBuy = row.cash > 2500000 && row.videocards + 50 <= MaxVideocards[row.isVIP];
  
      if (canBuy) {
        db.run('UPDATE users SET videocards = videocards + 50, cash = cash - 2500000 WHERE id = ?', [user_id]);
        await bot.sendMessage(msg.chat.id, callbackQuery.from.first_name +" ты успешно купил 50 видеокарт!",{ reply_to_message_id: msg.message_id });
        return;
      }
      await bot.sendMessage(msg.chat.id, callbackQuery.from.first_name + ", ты не можешь купить 50 видеокарт! \nУ тебя будет превышен лимит либо у тебя недостаточно денег.",{ reply_to_message_id: msg.message_id });
    });
  }else if (call.data == '/shop.100Videocard') {
    db.get("SELECT videocards,isVIP,cash FROM users WHERE id = ?", [user_id], async (err, row) => {
      if (row == undefined){bot.sendMessage(msg.chat.id, `❗️ ${profile_link}, у тебя нет аккаунта!\nНапиши любую команду, чтобы зарегистрироваться.`);return}
      let canBuy = row.cash > 5000000 && row.videocards + 100 <= MaxVideocards[row.isVIP];
  
      if (canBuy) {
        db.run('UPDATE users SET videocards = videocards + 100, cash = cash - 5000000 WHERE id = ?', [user_id]);
        await bot.sendMessage(msg.chat.id, callbackQuery.from.first_name +" ты успешно купил 100 видеокарт!", { reply_to_message_id: msg.message_id });
        return;
      }
      await bot.sendMessage(msg.chat.id, callbackQuery.from.first_name + ", ты не можешь купить 100 видеокарт! \nУ тебя будет превышен лимит либо у тебя недостаточно денег.", { reply_to_message_id: msg.message_id });
    });
  }
  
  else if (call.data == '/shop.vip') {
    db.get("SELECT isVIP,cash FROM users WHERE id = ?", user_id, async (err, row) => {
      if (row == undefined){bot.sendMessage(msg.chat.id, `❗️ ${profile_link}, у тебя нет аккаунта!\nНапиши любую команду, чтобы зарегистрироваться.`);return}
      let canBuy = row.cash >= 1000000 && row.isVIP < 1 ? true:false;
  
      if (canBuy) {
        db.run('UPDATE users SET isVIP = 1, cash = cash - 1000000 WHERE id = ?', [user_id]);
        await bot.sendMessage(msg.chat.id, callbackQuery.from.first_name +" ты успешно купил ⭐️VIP!",{ reply_to_message_id: msg.message_id });
        return;
      }
      await bot.sendMessage(msg.chat.id, callbackQuery.from.first_name + ", ты не можешь купить ⭐️VIP!",{ reply_to_message_id: msg.message_id });
    });
  
  }else if (call.data == '/shop.megavip') {
    db.get("SELECT isVIP,cash FROM users WHERE id = ?", [user_id], async (err, row) => {
      if (row == undefined){bot.sendMessage(msg.chat.id, `❗️ ${profile_link}, у тебя нет аккаунта!\nНапиши любую команду, чтобы зарегистрироваться.`);return}
      let canBuy = row.cash >= 50000000 && row.isVIP < 2 ? true:false;
  
      if (canBuy) {
        db.run('UPDATE users SET isVIP = 2, cash = cash - 50000000 WHERE id = ?', [user_id]);
        await bot.sendMessage(msg.chat.id, callbackQuery.from.first_name +" ты успешно купил 🌟MEGAVIP!",{ reply_to_message_id: msg.message_id });
        return;
      }
      await bot.sendMessage(msg.chat.id, callbackQuery.from.first_name + ", ты не можешь купить 🌟MEGAVIP!",{ reply_to_message_id: msg.message_id });
    });
  
  }
  else if (call.data === 'invite') {
    if (lastToId === 0) {
      bot.sendMessage(call.message.chat.id, `❗️ ${profile_link}, информация о пользователе не доступна.`, { reply_to_message_id: msg.message_id, parse_mode: 'HTML'});
    } else {
      const clanmarkup = {
        inline_keyboard: [
          [
            { text: '✅ Принять', callback_data: 'inv_yes' },
            { text: '❎ Отклонить', callback_data: 'inv_no' },
          ],
        ],
      };

      db.get('SELECT owner, name FROM clans WHERE owner=?', [user_id], (err, row) => {
        if (err) {
          console.error(err);
          return;
        }

        if (!row) {
          bot.sendMessage(call.message.chat.id, `❗️ ${profile_link}, ты не являешься владельцем клана!`, { reply_to_message_id: msg.message_id, parse_mode: 'HTML'});
          lastToId = 0;
        } else {
          db.run('INSERT INTO invitations (inviter_id, clan_name, invited_id) VALUES (?, ?, ?)', [user_id, row.name, lastToId], (err) => {
            if (err) {
              console.error(err);
              return;
            }

            bot.sendMessage(call.message.chat.id, `${profile_link}, приглашение успешно отправлено!`, { reply_to_message_id: msg.message_id, parse_mode: 'HTML'});
            bot.sendMessage(lastToId, `✉️ ${profile_link} приглашает тебя в свой клан!`, { reply_to_message_id: msg.message_id, parse_mode: 'HTML',
              reply_markup: clanmarkup,
            });
            lastToId = 0;
          });
        }
      });
    }
  } else if (call.data === 'create') {
    db.get('SELECT cash, clan, id FROM users WHERE id=?', [user_id], (err, row) => {
      if (row == undefined){bot.sendMessage(msg.chat.id, `❗️ ${profile_link}, у тебя нет аккаунта!\nНапиши любую команду, чтобы зарегистрироваться.`, { reply_to_message_id: msg.message_id, parse_mode: 'HTML'});return}
      if (err) {
        console.error(err);
        return;
      }

      const cash = row.cash;
      const myclan = row.clan;

      if (cash != undefined) { 
        db.all('SELECT owner FROM clans', (err, clans) => {
          if (err) {
            console.error(err);
            return;
          }

          if (clans.length === 0) {
            if (call.message.chat.type !== 'private') {
              bot.sendMessage(call.message.chat.id, `❌ ${profile_link}, Команда работает только в личке с ботом.`, { reply_to_message_id: msg.message_id, parse_mode: 'HTML'});
            } else {
              bot.sendMessage(call.message.chat.id, '📋 Регистрация клана: \n Напиши название клана.');
              bot.once('text', (msg) => {
                createProcess(user_id, msg);
              });
            }
          } else {
            if (row.id === clans[0].owner) {
              bot.sendMessage(call.message.chat.id, `❗️${profile_link}, ты уже состоишь в клане ${row.clan}!`, { reply_to_message_id: msg.message_id, parse_mode: 'HTML'});
            } else if (myclan !== "0") {
              bot.sendMessage(call.message.chat.id, `❗️${profile_link}, у тебя уже есть клан ${row.clan}!`, { reply_to_message_id: msg.message_id, parse_mode: 'HTML'});
            } else {
              if (call.message.chat.type !== 'private') {
                bot.answerCallbackQuery(call.id, {text: `❌ Команда работает только в личке с ботом.`, show_alert: true});
              } else {
                bot.sendMessage(call.message.chat.id, '📋 Регистрация клана: \n Напиши название клана.');
                bot.once('text', (msg) => {
                  createProcess(user_id, msg);
                });
              }
            }
          }
        });
      } else {
        bot.sendMessage(call.message.chat.id, `❗️${profile_link}, у тебя нет учетной записи! Зарегистрируйся командой /start.`, { reply_to_message_id: msg.message_id, parse_mode: 'HTML'});
      }
    });
  } else if (call.data === 'inv_yes') {
    try {
    db.get('SELECT inviter_id, clan_name FROM invitations WHERE invited_id=?', [user_id], (err, invitation) => {
      if (err) {
        console.error(err);
        return;
      }

      const inviter_id = invitation.inviter_id;
      const clan_name = invitation.clan_name;

      db.run('UPDATE users SET clan=? WHERE id=?', [clan_name, user_id], (err) => {
        if (invitation == undefined){bot.sendMessage(msg.chat.id, `❗️ ${profile_link}, у тебя нет аккаунта!\nНапиши любую команду, чтобы зарегистрироваться.`, { reply_to_message_id: msg.message_id, parse_mode: 'HTML'});return}

        if (err) {
          console.error(err);
          return;
        }

        bot.sendMessage(user_id, `Вы успешно приняли приглашение и вступили в клан ${clan_name}!`);
        bot.deleteMessage(msg.chat.id, msg.message_id);
        bot.sendMessage(inviter_id, `Ваше приглашение в клан ${clan_name} было принято!`);
        lastToId = 0;
      });

      db.run('DELETE FROM invitations WHERE invited_id=?', [user_id], (err) => {
        if (err) {
          console.error(err);
          return
        } 
      });
    });} catch (error) {
      console.log(error) 
      return
    }
  } else if (call.data === 'inv_no') {
    try {
    db.get('SELECT inviter_id, clan_name FROM invitations WHERE invited_id=?', [user_id], (err, invitation) => {
      
      if (err) {
        console.error(err);
        return;
      }

      const inviter_id = invitation.inviter_id;
      const clan_name = invitation.clan_name;
      bot.sendMessage(user_id, 'Вы отклонили приглашение в клан!');
      bot.deleteMessage(msg.chat.id, msg.message_id);  
      bot.sendMessage(inviter_id, `Ваше приглашение в клан ${clan_name} было отклонено!`);
      lastToId = 0;

      db.run('DELETE FROM invitations WHERE invited_id=?', [user_id], (err) => {
        if (err) {
          console.error(err);
        }
      });
    });} catch (error) {
      console.log(error)
      return
    }
  }} catch (error) {
    console.log(error)
    return
  }
});