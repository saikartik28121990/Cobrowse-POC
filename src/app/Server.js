const express = require("express");
const path = require("path");

const app = express();

// Path to Angular build folder
const distPath = path.join(__dirname, "dist/ems-portal");

// Serve static files
app.use(express.static(distPath));

// Handle Angular routing (important!)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Railway provides PORT automatically
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
