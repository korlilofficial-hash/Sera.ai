export default async function handler(req, res) {
  const { text, system } = req.body;
  const TOKEN = process.env.HF_TOKEN;

  // ПРАВИЛЬНЫЙ URL ДЛЯ РОУТЕРА (с указанием задачи)
  const URL = "https://router.huggingface.co";

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN.trim()}` 
      },
      body: JSON.stringify({ 
        model: "Qwen/Qwen2.5-7B-Instruct", // Указываем модель здесь
        messages: [
            { role: "system", content: system },
            { role: "user", content: text }
        ],
        max_tokens: 500
      }),
    });

    const data = await response.json();

    if (data.error) {
      if (data.estimated_time) return res.status(200).json({ reply: "Sera просыпается... (загрузка 20 сек)" });
      return res.status(200).json({ reply: "Ошибка HF: " + JSON.stringify(data.error) });
    }

    // В новом роутере ответ приходит как у OpenAI (choices[0].message.content)
    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply: reply.trim() });

  } catch (error) {
    return res.status(200).json({ reply: "Ошибка: " + error.message });
  }
}
