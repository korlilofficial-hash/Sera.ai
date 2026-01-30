export default async function handler(req, res) {
  const { text, system } = req.body;
  const TOKEN = process.env.HF_TOKEN;

  // Используем максимально стабильный эндпоинт v1 (как у OpenAI)
  const URL = "https://router.huggingface.co";

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN.trim()}` 
      },
      body: JSON.stringify({ 
        model: "meta-llama/Llama-3.2-3B-Instruct", // Эта модель всегда онлайн
        messages: [
            { role: "system", content: system },
            { role: "user", content: text }
        ],
        max_tokens: 500
      }),
    });

    // Читаем как текст, чтобы поймать ошибку, если это не JSON
    const resText = await response.text();
    let data;
    try {
        data = JSON.parse(resText);
    } catch(e) {
        return res.status(200).json({ reply: "Sera: Ошибка связи (Not Found). Проверьте Redeploy на Vercel." });
    }

    if (data.error) {
      return res.status(200).json({ reply: "Sera: " + (data.error.message || JSON.stringify(data.error)) });
    }

    // Извлекаем ответ в формате OpenAI
    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply: reply.trim() });

  } catch (error) {
    return res.status(200).json({ reply: "Ошибка бэкенда: " + error.message });
  }
}
