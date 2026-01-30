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

    // Если модель еще не загружена
    if (data.error && data.estimated_time) {
      return res.status(200).json({ reply: "Sera просыпается... Повторите запрос через 20 секунд." });
    }

    // ВЫТЯГИВАЕМ ТЕКСТ (Жесткий метод)
    let reply = "";
    
    if (Array.isArray(data) && data.length > 0) {
      // Если пришел массив (как обычно в HF)
      reply = data[0].generated_text || data[0].text || "";
    } else if (data.generated_text) {
      // Если пришел объект
      reply = data.generated_text;
    } else {
      // Если вообще не понятно что, выводим сырые данные для отладки
      reply = "Sera: Ошибка формата данных. Получено: " + JSON.stringify(data);
    }

    // Убираем лишние технические теги, если они остались
    const cleanReply = reply.replace(/<\|im_end\|>/g, "").replace(/<\|im_start\|>/g, "").trim();

    return res.status(200).json({ reply: cleanReply || "Sera: Я задумалась, повтори!" });

  } catch (error) {
    return res.status(200).json({ reply: "Ошибка на бэкенде: " + error.message });
  }
}
