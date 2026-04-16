import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";
import ExpenseList from "../components/ExpenseList";
import AddExpense from "../components/AddExpense";


const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false); 
  const navigate = useNavigate();

  const getUserData = async () => {
    try {
      
      const token = localStorage.getItem("auth_Token");
      if (!token) {
        navigate("/");
        return;
      }
      const response = await API.get("/users/get-user", {
        // headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.data.success) {
        toast.error("Session expired, please login again");
        navigate("/");
      }
    } catch (error) {
      toast.error("Something went wrong");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <AddExpense onExpenseAdded={() => setRefresh(!refresh)} />
        <ExpenseList refresh={refresh} />
      </div>
    </div>
  );
};

export default Dashboard;