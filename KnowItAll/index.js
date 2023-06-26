import { Configuration, OpenAIApi } from 'openai'
import { process } from './env'

import { initializeApp } from 'firebase/app'
import {getDatabase, ref,push,get,remove} from 'firebase/database'



const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const appSettings  ={
    databaseURL :process.env.FIREBASE_DB_URL
}

const app= initializeApp(appSettings)

const database=getDatabase(app)

const conversationInDb=ref(database)

document.getElementById('clear-btn').addEventListener('click', () => {
    remove(conversationInDb);
    chatbotConversation.innerHTML = '<div class="speech speech-ai">How can I help you?</div>'
    })


const chatbotConversation = document.getElementById('chatbot-conversation')


// const conversationsArr = [
//     {
//         role:'system',
//         content:'You are a highly sarcastic assistant that gives short detailed answers',
//     }
// ]

const instructionObj={
        role:'system',
        content:'You are a highly sarcastic assistant that gives short detailed answers',
}

document.addEventListener('submit', (e) => {
    e.preventDefault()
    const userInput = document.getElementById('user-input')

    // conversationsArr.push({
    //     role:'user',
    //     content:userInput.value.trim()
    // })
    push(conversationInDb,{
        role:'user',
        content:userInput.value.trim()
    })

    fetchReply()
    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-human')
    chatbotConversation.appendChild(newSpeechBubble)
    newSpeechBubble.textContent = userInput.value
    userInput.value = ''
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
})

function fetchReply(){
    get(conversationInDb).then(async (snapshot)=>{
        if(snapshot.exists()){
            const nokeydata= Object.values(snapshot.val())
            nokeydata.unshift(instructionObj)
            const response= await openai.createChatCompletion({
                model:'gpt-3.5-turbo',
                messages:nokeydata,
                presence_penalty:0, // Default:0,
                frequency_penalty:0.3,  //Default:0  Too high can also result in bad results or bad english    ⚠️ Do not st to -2 as it will repeat until all tokens are used
            })
            
            const botReply= response.data.choices[0].message
            const renderText=botReply.content
            push(conversationInDb,botReply)
            renderTypewriterText(renderText)

        }
        else{
            console.log('No data available')
        }
    })
    // const response=await openai.createChatCompletion({
    //     model:'gpt-3.5-turbo',
    //     messages:conversationsArr,
    //     presence_penalty:0, // Default:0,
    //     frequency_penalty:0.3,  //Default:0  Too high can also result in bad results or bad english    ⚠️ Do not st to -2 as it will repeat until all tokens are used
    // })

    // const botReply= response.data.choices[0].message
    // const renderText=botReply.content
    // conversationsArr.push(botReply)
    // renderTypewriterText(renderText)

}




function renderConversationsFromDB(){
    get(conversationInDb).then((snapshot)=>{
        if(snapshot.exists){
            const convesations=Object.values(snapshot.val()).forEach(
                dbObj=>{
                    const newSpeechBubble = document.createElement('div')
                    newSpeechBubble.classList.add(
                        'speech',
                        `speech-${dbObj.role === 'user' ? 'human' : 'ai'}`
                        )
                    chatbotConversation.appendChild(newSpeechBubble)
                    newSpeechBubble.textContent = dbObj.content
                })
                chatbotConversation.scrollTop=chatbotConversation.scrollHeight
        }
    })
}


function renderTypewriterText(text) {
    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-ai', 'blinking-cursor')
    chatbotConversation.appendChild(newSpeechBubble)
    let i = 0
    const interval = setInterval(() => {
        newSpeechBubble.textContent += text.slice(i-1, i)
        if (text.length === i) {
            clearInterval(interval)
            newSpeechBubble.classList.remove('blinking-cursor')
        }
        i++
        chatbotConversation.scrollTop = chatbotConversation.scrollHeight
    }, 50)
}


renderConversationsFromDB()
    