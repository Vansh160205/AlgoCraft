const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const {generateBoilerplate} = require('../utils/boilerplateGenerator');
const { generateSlug } = require('../utils/slugGenerator');

exports.createProblem = async (req, res) => {
  try {
    const { title, description,difficulty, inputFormat, outputFormat,testCases,companyTags,topicTags } = req.body;

     const slug = generateSlug(title);
     const boilerplatePython = generateBoilerplate('python', inputFormat, outputFormat);
    const boilerplateCpp = generateBoilerplate('cpp', inputFormat, outputFormat);
    const boilerplateJava = generateBoilerplate('java', inputFormat, outputFormat);
    const problem = await prisma.problem.create({
      data: {
        title,
        slug,
        description,
        difficulty,
        inputFormat,
        outputFormat,
        companyTags,
        topicTags,
        testCases: {
          create: testCases.length > 0 ? testCases : [],
        },
        boilerplatePython,
        boilerplateCpp,
        boilerplateJava
      },include: {
            testCases: true
        }
    });
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProblems = async (req, res) => {
  const problems = await prisma.problem.findMany();
  console.log(problems);
  res.json(problems);
};

exports.updateProblem = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, description, difficulty, inputFormat, outputFormat,testCases,companyTags,topicTags } = req.body;
        const boilerplatePython = generateBoilerplate('python', inputFormat, outputFormat);
        const boilerplateCpp = generateBoilerplate('cpp', inputFormat, outputFormat);
        const boilerplateJava = generateBoilerplate('java', inputFormat, outputFormat);

        const problem = await prisma.problem.update({
            where: { slug },
            data: {
                title,
                description,
                difficulty,
                companyTags,
                topicTags,
                inputFormat,
                outputFormat,
                
        
                boilerplatePython,
                boilerplateCpp,
                boilerplateJava
            }
        });

        if (testCases.length > 0) {
      await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
      await prisma.testCase.createMany({
        data: testCases.map((tc) => ({ ...tc, problemId: problem.id })),
      });
    }

        res.json(problem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
            

exports.getProblemBoilerplate = async (req, res) => {
    const { slug } = req.params;
    const { language } = req.params;
    const problem = await prisma.problem.findUnique({
        where: {slug: slug},
        select: {
            boilerplatePython: true,
            boilerplateCpp: true,
            boilerplateJava: true
        }
        });
    if (!problem) 
        return res.status(404).json({ message: 'Problem not found' });
    let boilerplate;
    switch (language) {
        case 'python':
            boilerplate = problem.boilerplatePython;
            break;
        case 'cpp':
            boilerplate = problem.boilerplateCpp;
            break;
        case 'java':
            boilerplate = problem.boilerplateJava;
            break;
        default:
            return res.status(400).json({ message: 'Unsupported language' });
    }
    if (!boilerplate) return res.status(404).json({ message: 'Boilerplate not found for this language' });
    res.json({ boilerplate });
}
exports.getProblemBySlug = async (req, res) => {
  const { slug } = req.params;
  const problem = await prisma.problem.findUnique({ where: { slug } ,
    include: {
      testCases: {
      take: 3, // ✅ Limit to 3
      orderBy: { id: 'asc' }, 
      }
    }
  });
  if (!problem) return res.status(404).json({ message: 'Problem not found' });
  res.json(problem);
};
