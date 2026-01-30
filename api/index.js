export default async function handler(req, res) {
  const { text, system } = req.body;
  const TOKEN = process.env.HF_TOKEN;

  try {
    const response = await fetch("https://router.huggingface.co", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN.trim()}` 
      },
      body: JSON.stringify({ 
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
            { role: "system", content: system },
            { role: "user", content: text }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();

    // Если ИИ спит или ошибка
    if (data.error) {
      return res.status(200).json({ reply: "Sera: " + (data.error.message || "Техработы") });
    }

    // Вытаскиваем ответ
    const result = data.choices[0].message.content;
    return res.status(200).json({ reply: result.trim() });

  } catch (err) {
    return res.status(200).json({ reply: "Ошибка связи: " + err.message });
  }
}
