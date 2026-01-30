export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Только POST запросы');
  
  const { text, system } = req.body;
  const TOKEN = process.env.HF_TOKEN;

  if (!TOKEN) return res.status(200).json({ reply: "Ошибка: Токен HF_TOKEN не найден в настройках Vercel!" });

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co",
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
      // Если модель грузится, HF возвращает estimated_time
      if (data.estimated_time) return res.status(200).json({ reply: "Sera просыпается (загрузка модели)... Подождите 20 секунд и напишите еще раз." });
      return res.status(200).json({ reply: "Ошибка от HuggingFace: " + JSON.stringify(data.error) });
    }

    const result = Array.isArray(data) ? data[0].generated_text : data.generated_text;
    return res.status(200).json({ reply: result || "Пустой ответ от модели" });

  } catch (error) {
    return res.status(200).json({ reply: "Ошибка сервера: " + error.message });
  }
}
