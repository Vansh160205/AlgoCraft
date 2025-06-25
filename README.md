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

* Admin panel (Add problem)
* Code editor in action
* Test case tab interaction

---

## 👌 Contributing

Pull requests are welcome! Feel free to fork the repository and submit improvements, bug fixes, or new features.

---

## ✉️ License

This project is licensed under the MIT License.

---

> Made with ❤️ by \[Your Name] for learning, practice, and the love of clean code.
