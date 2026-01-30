export default async function handler(req, res) {
  const { text, system } = req.body;
  const TOKEN = process.env.HF_TOKEN;

  // НОВЫЙ АДРЕС (БЕЗ api-inference в начале)
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

    const data = await response.json();

    if (data.error) {
      if (data.estimated_time) return res.status(200).json({ reply: "Sera просыпается... Подождите 20 секунд." });
      return res.status(200).json({ reply: "Ошибка HF: " + JSON.stringify(data.error) });
    }

    // Жесткое извлечение текста
    let out = Array.isArray(data) ? data[0].generated_text : data.generated_text;
    
    // Очистка от мусора
    out = out.replace(/<\|im_end\|>/g, "").replace(/<\|im_start\|>/g, "").trim();

    return res.status(200).json({ reply: out || "Sera: Пустой ответ." });

  } catch (error) {
    return res.status(200).json({ reply: "Ошибка сервера: " + error.message });
  }
}
