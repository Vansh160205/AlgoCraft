const {PrismaClient} = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();


exports.registerUser = async (req, res) => {
  try {
    const {email,name,password}= req.body;
    console.log(email)
    let user = await prisma.user.findUnique({where:{email:email}});
    if(user){
      return res.status(500).json({error:"user already exist"});
    }  
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: hashedPassword
      }
    });
    console.log(user);
    const token = jwt.sign({ id:user.id}, process.env.JWT_SECRET,{expiresIn: '1h'});
    console.log("token: ",token);
    res.status(201).json({user:user,token: token} );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const {email,password}= req.body;
    console.log(email)
    const user = await prisma.user.findUnique({where:{email:email}});
    if(user){
      const hashedPassword=await bcrypt.hash(password, 10);
      const isMatch = await bcrypt.compare(password, user.password);
      
      if(!isMatch){
        return res.status(400).json({error:"Invalid password"});
      }
      const token = jwt.sign({ id:user.id}, process.env.JWT_SECRET,{expiresIn: '24h'});
      console.log("token: ",token);
      res.status(201).json({user:user,token: token} );
    }  else{
      res.status(400).json({error:`user with email ${email} not found`});
    }
    
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized: User not authenticated.' });
  }

  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        submissions: {
          orderBy: {
            submittedAt: 'desc', // Order by most recent submissions first
          },
          select: {
            id: true,
            status: true,
            language: true,
            runtime: true,
            memory: true,
            submittedAt: true,
            problem: { // Include related problem details
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    console.log(user);

    res.status(200).json(user);

  } catch (error) {
    console.error('Error fetching user profile and submissions:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile and submissions.' });
  }
};


exports.getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
};


