export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Только POST');
  
  const { text, system } = req.body;
  const TOKEN = process.env.HF_TOKEN;

  try {
    const response = await fetch(
      "https://router.huggingface.co",
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN.trim()}` 
        },
        body: JSON.stringify({ 
          inputs: `<|im_start|>system\n${system}<|im_end|>\n<|im_start|>user\n${text}<|im_end|>\n<|im_start|>assistant\n`,
          parameters: { max_new_tokens: 500, return_full_text: false }
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      if (data.estimated_time) return res.status(200).json({ reply: "Sera просыпается... Подождите 20 секунд." });
      return res.status(200).json({ reply: "Ошибка: " + JSON.stringify(data.error) });
    }

    // Обработка ответа (Hugging Face возвращает массив объектов)
    const result = Array.isArray(data) ? data[0].generated_text : data.generated_text;
    return res.status(200).json({ reply: result || "Пустой ответ" });

  } catch (error) {
    return res.status(200).json({ reply: "Ошибка сервера: " + error.message });
  }
}
