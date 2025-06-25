const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const boilerplateGenerator = require('./utils/boilerplateGenerator');

const code = boilerplateGenerator.generateBoilerplate("python", "/function name:add\nnum1:int\nnum2:int", "result:int");
console.log(code);

require("dotenv").config();


// Routes
const submissionsRoute = require('./routes/submissions');
const auth = require('./middleware/auth')
const problemRoutes = require('./routes/problems');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');

app.use('/api/submissions',submissionsRoute);
app.use('/api/problems', problemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai',aiRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
