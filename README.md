# 🧠 AlgoCraft – Online Coding Platform

**AlgoCraft** is a full-stack online coding platform designed for solving algorithmic problems, practicing data structures, and preparing for coding interviews. It provides an interactive code editor, custom test cases, and problem management—all built with a modern developer experience in mind.

---

## ✨ Features

* 📝 **Problem Management**: Admin can add new problems with title, description, difficulty, tags, input/output formats, and dynamic test cases.
* 👨‍💼 **Code Editor**: Integrated code editor with syntax highlighting and multiple language support (via [Judge0](https://judge0.com/)).
* 📋 **Test Cases**: Dynamically handle test cases with customizable parameters and expected outputs.
* 🔐 **Authentication**: JWT-based login system with role-based access (admin/user).
* 🚀 **Dynamic UI**: Built using **Next.js** with **Tailwind CSS** and **shadcn/ui** for a responsive and sleek interface.
* 🧢 **Tags and Metadata**: Add company tags, topic tags for filtering and better categorization.
* 🔍 **Code Complexity Analysis**: Optional AI-powered feedback and complexity suggestions.

---

## 💠 Tech Stack

| Frontend                 | Backend                 | Others                   |
| ------------------------ | ----------------------- | ------------------------ |
| Next.js (App Router)     | Express.js + Prisma ORM | Judge0 API for execution |
| Tailwind CSS + shadcn/ui | PostgreSQL DB           | JWT Auth                 |
| Axios                    | TypeScript              | RESTful API              |

---

## 🛆 Installation

```bash
# Clone the repo
git clone https://github.com/your-username/algocraft.git
cd algocraft

# Setup frontend
cd client
npm install
npm run dev

# Setup backend
cd ../server
npm install
npm run dev
```

> ⚙️ Make sure to add `.env` files in both frontend and backend directories.

---

## 📸 Screenshots (Optional)

Include screenshots or GIFs of:
  ### Login
  ![Screenshot 2025-07-06 122331](https://github.com/user-attachments/assets/f949a3a1-a6f1-444b-b75a-3fa805b665d3)
  ### Register
  ![Screenshot 2025-07-06 122403](https://github.com/user-attachments/assets/1071ff9c-0ecb-4e16-bb7e-b193f00d2c85)
  ### Add Problem
  ![Screenshot 2025-07-06 122524](https://github.com/user-attachments/assets/2afa4db8-43e5-47bd-8fbf-df21a0e92e92)
  ### Test case tab interaction
  ![Screenshot 2025-07-06 122546](https://github.com/user-attachments/assets/08772829-cf22-4c0e-8ea4-c6666897d19d)
  ### Landing Page
  ![Screenshot 2025-07-06 122617](https://github.com/user-attachments/assets/a603a489-76fa-4e41-914d-197be96af5d4)
  ### Problem List Page
  ![Screenshot 2025-07-06 122702](https://github.com/user-attachments/assets/6bc699d3-d9a2-455e-93ce-18be9fbe518d)
  ### Problem Page Code Editor in action
  ![Screenshot 2025-07-06 122739](https://github.com/user-attachments/assets/16ac1e02-760c-419c-93df-0fcde948af56)
  ### Complexity Analysis by AI
  ![Screenshot 2025-07-06 122900](https://github.com/user-attachments/assets/731f43a2-03d7-4e99-b8f2-d102bb330de3)
  ### Test Case Result By Judge0
  ![Screenshot 2025-07-06 181352](https://github.com/user-attachments/assets/0f13f662-18fb-48c4-96f1-287a6beb9c25)
  ### Profile page with submission history
  ![image](https://github.com/user-attachments/assets/e42813e6-72a3-4d06-ac9a-c9842ab03a8e)

---

## 👌 Contributing

Pull requests are welcome! Feel free to fork the repository and submit improvements, bug fixes, or new features.

---

## ✉️ License

This project is licensed under the MIT License.

---

> Made with ❤️ by \[Your Name] for learning, practice, and the love of clean code.
