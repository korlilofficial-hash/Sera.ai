// api/chat.js
export default async function handler(req, res) {
  const { text, system } = req.body;
  const TOKEN = process.env.HF_TOKEN; // Токен будет спрятан в настройках

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}` 
        },
        body: JSON.stringify({ 
          inputs: `<|im_start|>system\n${system}<|im_end|>\n<|im_start|>user\n${text}<|im_end|>\n<|im_start|>assistant\n`,
          parameters: { max_new_tokens: 500, return_full_text: false }
        }),
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
}
