export default async function handler(req, res) {
  const TOKEN = process.env.HF_TOKEN;
  const { text, system } = req.body;

  try {
    const response = await fetch("https://router.huggingface.co", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN.trim()}` 
      },
      body: JSON.stringify({ 
        model: "Qwen/Qwen2.5-7B-Instruct",
        messages: [{role: "system", content: system}, {role: "user", content: text}],
        max_tokens: 500
      })
    });

    const resText = await response.text();
    
    // Если пришел не JSON (например, Not Found или Ошибка 401)
    if (!resText.startsWith('{') && !resText.startsWith('[')) {
        return res.status(200).json({ reply: "Ошибка сервера: " + resText });
    }

    const data = JSON.parse(resText);
    if (data.error) return res.status(200).json({ reply: "Sera: " + (data.error.message || JSON.stringify(data.error)) });
    
    return res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    return res.status(200).json({ reply: "Критическая ошибка: " + err.message });
  }
}
