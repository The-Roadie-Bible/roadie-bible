export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { place_name, city, country, description } = req.body;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Roadie Bible <onboarding@resend.dev>",
        to: "admin@roadiebible.com",
        subject: `New Roadie Bible Submission: ${place_name}`,
        html: `
          <h2>New Submission</h2>
          <p><strong>Place:</strong> ${place_name}</p>
          <p><strong>City:</strong> ${city}</p>
          <p><strong>Country:</strong> ${country}</p>
          <p><strong>Description:</strong></p>
          <p>${description}</p>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
