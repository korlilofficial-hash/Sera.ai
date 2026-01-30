export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Метод не разрешен');
  
  const { text, system } = req.body;
  const TOKEN = process.env.HF_TOKEN;

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

    if (data.error && data.estimated_time) {
      return res.status(200).json({ reply: "Sera просыпается... Повторите через 15 секунд." });
    }

    // ВНИМАНИЕ: Правильное извлечение текста из массива Hugging Face
    let reply = "";
    if (Array.isArray(data) && data[0] && data[0].generated_text) {
      reply = data[0].generated_text;
    } else {
      reply = data.generated_text || "Я получила данные, но формат странный. Попробуй еще раз!";
    }

    return res.status(200).json({ reply: reply.trim() });

  } catch (error) {
    return res.status(200).json({ reply: "Ошибка на бэкенде: " + error.message });
  }
}
