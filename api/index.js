export default async function handler(req, res) {
  const { text, system } = req.body;
  const TOKEN = process.env.HF_TOKEN;

  // ИСПОЛЬЗУЕМ САМЫЙ СТАБИЛЬНЫЙ ЭНДПОИНТ
  const URL = "https://router.huggingface.co";

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN.trim()}` 
      },
      body: JSON.stringify({ 
        model: "meta-llama/Llama-3.2-3B-Instruct", // Эта модель — «рабочая лошадка»
        messages: [
            { role: "system", content: system },
            { role: "user", content: text }
        ],
        parameters: { max_new_tokens: 500 }
      }),
    });

    const resText = await response.text();
    
    // Если всё равно 404 — значит Vercel не видит папку api
    if (response.status === 404) {
        return res.status(200).json({ reply: "Sera: Ошибка 404. Попробуйте переименовать файл в api/index.js" });
    }

    const data = JSON.parse(resText);

    if (data.error) {
      return res.status(200).json({ reply: "Sera: " + (data.error.message || JSON.stringify(data.error)) });
    }

    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply: reply.trim() });

  } catch (error) {
    return res.status(200).json({ reply: "Ошибка: " + error.message });
  }
}
