export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Метод не разрешен');
  
  const { text, system } = req.body;
  const TOKEN = process.env.HF_TOKEN;

  try {
    // ВНИМАНИЕ: Новый адрес роутера Hugging Face
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

    // Если модель еще грузится
    if (data.error && data.estimated_time) {
      return res.status(200).json({ reply: "Sera просыпается... Повторите запрос через 20 секунд." });
    }

    // Извлекаем текст (с учетом нового формата роутера)
    let reply = "";
    if (Array.isArray(data) && data.length > 0) {
      reply = data[0].generated_text || "";
    } else if (data.generated_text) {
      reply = data.generated_text;
    } else {
      reply = "Sera: Ошибка. Получено: " + JSON.stringify(data);
    }

    const cleanReply = reply.replace(/<\|im_end\|>/g, "").replace(/<\|im_start\|>/g, "").trim();
    return res.status(200).json({ reply: cleanReply || "Sera: Я задумалась, повтори!" });

  } catch (error) {
    return res.status(200).json({ reply: "Ошибка на бэкенде: " + error.message });
  }
}
