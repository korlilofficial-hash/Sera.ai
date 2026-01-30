export default async function handler(req, res) {
  const { text, system } = req.body;
  const TOKEN = process.env.HF_TOKEN;

  // Прямой путь через роутер к конкретной модели
  const URL = "https://router.huggingface.co";

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN.trim()}` 
      },
      body: JSON.stringify({ 
        inputs: `<|im_start|>system\n${system}<|im_end|>\n<|im_start|>user\n${text}<|im_end|>\n<|im_start|>assistant\n`,
        parameters: { max_new_tokens: 500, return_full_text: false }
      }),
    });

    const resText = await response.text();
    let data;
    try {
        data = JSON.parse(resText);
    } catch(e) {
        return res.status(200).json({ reply: "Sera: Ошибка сервера (не JSON). Ответ: " + resText });
    }

    if (data.error) {
      if (data.estimated_time) return res.status(200).json({ reply: "Sera просыпается... (загрузка модели)" });
      return res.status(200).json({ reply: "Ошибка: " + (data.error.message || JSON.stringify(data.error)) });
    }

    // В классическом API ответ — это массив объектов [{generated_text: "..."}]
    const result = Array.isArray(data) ? data[0].generated_text : data.generated_text;
    
    // Очистка от технических тегов
    const clean = (result || "").replace(/<\|im_end\|>/g, "").replace(/<\|im_start\|>/g, "").trim();

    return res.status(200).json({ reply: clean || "Sera: Я задумалась, повтори запрос!" });

  } catch (error) {
    return res.status(200).json({ reply: "Критическая ошибка бэкенда: " + error.message });
  }
}
