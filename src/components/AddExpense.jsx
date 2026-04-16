import { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

const AddExpense = ({ onExpenseAdded }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [images, setImages] = useState([]);
   const [fileKey, setFileKey] = useState(0);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Max 5 images allowed");
      return;
    }
    setImages(files);
  };

  const submitExpense = async (e) => {
    e.preventDefault();

    if (!title || !amount || !category) {
      toast.error("All fields are required");
      return;
    }
    if (amount <= 0) {
  toast.error("Amount must be positive");
  return;
}

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("amount", amount);
      formData.append("category", category);
      formData.append("date", date);

      console.log("images:", images);
      images.forEach((img) => {
        console.log("appending:", img.name);
        formData.append("billImage", img);
      });

      await API.post("/expenses", formData);
      // {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });

      toast.success("Expense Added");
      setTitle("");
      setAmount("");
      setCategory("");
       setDate(""); 
      setImages([]);
      setFileKey(prev => prev + 1);
      onExpenseAdded();
    } catch (error) {
      console.log("error response:", error.response?.data);
      console.log("status:", error.response?.status);
      toast.error("Failed to add expense");
    }
  };

  return (
    <div className="card">
      <h2>Add Expense</h2>
      <form onSubmit={submitExpense}>
        <input
          placeholder="Expense Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          type="date"
          value={date}
          max={new Date().toISOString().split("T")[0]} 
          onChange={(e) => setDate(e.target.value)}
          style={{ color: "white",
           colorScheme: "dark" 
           }}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Other">Other</option>
        </select>
        <input
           key={fileKey}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          style={{ color: "white", marginTop: "8px" }}
        />
        {images.length > 0 && (
          <p style={{ color: "#1abc9c", fontSize: "13px" }}>
            {images.length} image(s) selected
          </p>
        )}

        <button>Add Expense</button>
      </form>
    </div>
  );
};

export default AddExpense;
