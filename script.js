const dropBtn = document.getElementById("drop-button");
const sendBtn = document.getElementById("send-btn");
const menuBtn = document.getElementById("menu_btn");

const aside = document.querySelector(".sidebar");

const dropOptions = document.querySelector(".drop-options");
const dropGemini = document.getElementById("option-gemini");
const dropGpt = document.getElementById("option-gpt");
const dropChoice = document.getElementById("option-choice");

const aiName = document.getElementById("ai-name");
const aiSelected = document.querySelector(".ai-selected");

const showResponse = document.querySelector(".response-area");
const responseText = document.querySelector(".response-text");

const apiKey = document.getElementById("api-key");
const userQuestion = document.getElementById("question");

const newChat = document.querySelector(".new-chat-btn");

let isOpen = false;

dropBtn.addEventListener("click", () => {
  if (!isOpen) {
    dropOptions.classList.remove("hide-dropdown");
    dropOptions.classList.add("show-dropdown");
    dropBtn.classList.add("show-style");
    isOpen = true;
  } else {
    dropOptions.classList.remove("show-dropdown");
    dropOptions.classList.add("hide-dropdown");
    dropBtn.classList.remove("show-style");
    isOpen = false;
  }
});

function selectOption(optionText) {
  aiName.textContent = optionText;
  dropOptions.classList.remove("show-dropdown");
  dropOptions.classList.add("hide-dropdown");
  dropBtn.classList.remove("show-style");
  isOpen = false;
}

dropChoice.addEventListener("click", () => {
  selectOption("Escolha a IA desejada");
});

dropGemini.addEventListener("click", () => {
  selectOption("Gemini");
});

dropGpt.addEventListener("click", () => {
  selectOption("GPT-4.1 Nano");
});

menuBtn.addEventListener("click", () => {
  aside.classList.toggle("closed-sidebar");
});

sendBtn.addEventListener("click", async () => {
  showResponse.classList.add("visible-response");

  const userMessage = document.createElement("div");
  userMessage.className = "user-message";
  userMessage.textContent = userQuestion.value;

  const aiMessage = document.createElement("div");
  aiMessage.className = "ai-message";
  aiMessage.textContent = "Carregando...";

  const chatHistory = document.querySelector(".chat-history");
  chatHistory.appendChild(userMessage);
  chatHistory.appendChild(aiMessage);

  const apiToken = apiKey.value;
  const questionText = userQuestion.value;

  await sendQuestion(apiToken, questionText, aiMessage);

  userQuestion.value = "";
});

userQuestion.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    if (userQuestion.value.trim() !== "") {
      sendBtn.click();
    }
  }
});

async function sendQuestion(apiToken, questionText, aiMessage) {
  aiMessage.textContent = "Carregando...";
  if (!apiToken) {
    aiMessage.textContent = "Por favor, insira sua API Key.";
    return;
  }

  let apiUrl;
  let requestOptions;

  const aiInUse = aiName.textContent;

  if (aiInUse.includes("Gemini")) {
    apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiToken}`;
    requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: questionText }],
          },
        ],
      }),
    };
  } else if (aiInUse.includes("GPT-4.1 Nano")) {
    apiUrl = "https://api.openai.com/v1/chat/completions";

    requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um assistente útil." },
          { role: "user", content: questionText },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    };
  } else {
    aiMessage.textContent = "Por favor, selecione uma IA no menu suspenso.";
    return;
  }

  try {
    const response = await fetch(apiUrl, requestOptions);
    const data = await response.json();

    if (data.error) {
      aiMessage.textContent = `Erro: ${data.error.message}`;
      console.error("Erro retornado pela API:", data.error);
      return;
    }

    if (aiInUse.includes("Gemini")) {
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        aiMessage.textContent = data.candidates[0].content.parts[0].text;
      } else {
        aiMessage.textContent =
          "Desculpe, não foi possível obter uma resposta do Gemini.";
      }
    } else if (aiInUse.includes("GPT-4.1 Nano")) {
      if (data.choices && data.choices[0] && data.choices[0].message) {
        aiMessage.textContent = data.choices[0].message.content;
      } else {
        aiMessage.textContent =
          "Desculpe, não foi possível obter uma resposta do GPT.";
      }
    }
  } catch (error) {
    aiMessage.textContent = `Erro: ${error.message}. Verifique a API Key ou a conexão.`;
    console.error("Erro na requisição:", error);
  }
}

newChat.addEventListener("click", () => {
  const chatHistory = document.querySelector(".chat-history");
  chatHistory.innerHTML = "";
  userQuestion.value = "";
  aiName.textContent = "Escolha a IA desejada";
  apiKey.value = "";
});
