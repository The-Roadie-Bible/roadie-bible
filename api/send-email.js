import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { place_name, city, country, description } = req.body;

    await resend.emails.send({
      from: "Roadie Bible <admin@roadiebible.com>",
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
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Email failed" });
  }
}
