export default async function handler(req, res) {
  const { text, system } = req.body;
  const TOKEN = process.env.HF_TOKEN;

  // САМЫЙ ПРЯМОЙ АДРЕС БЕЗ ЛИШНИХ СЛОВ
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

    // Проверяем, не пришел ли нам текст вместо JSON (чтобы не было ошибки "Unexpected token N")
    const responseText = await response.text();
    
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        return res.status(200).json({ reply: "Sera: Сервер прислал текст вместо данных. Текст: " + responseText });
    }

    if (data.error) {
      if (data.estimated_time) return res.status(200).json({ reply: "Sera просыпается... Подождите 20 секунд." });
      return res.status(200).json({ reply: "Ошибка HF: " + JSON.stringify(data.error) });
    }

    // Если пришел массив (стандарт для HF), берем первый элемент
    let out = Array.isArray(data) ? data[0].generated_text : data.generated_text;
    
    if (!out) return res.status(200).json({ reply: "Sera: Не удалось найти текст в ответе." });

    // Очистка от технических тегов
    out = out.replace(/<\|im_end\|>/g, "").replace(/<\|im_start\|>/g, "").trim();

    return res.status(200).json({ reply: out });

  } catch (error) {
    return res.status(200).json({ reply: "Критическая ошибка: " + error.message });
  }
}
