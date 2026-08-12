import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ComingSoon from './pages/ComingSoon';
import QuizHub from './pages/QuizHub';
import QuizPage from './pages/QuizPage';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import About from './pages/About';
import Feedback from './pages/Feedback';
import AdminFeedback from './pages/AdminFeedback';
import AdminUsers from './pages/AdminUsers';
import ArrayLesson from './pages/lessons/ArrayLesson';
import LinkedListLesson from './pages/lessons/LinkedListLesson';
import QueueLesson from './pages/lessons/QueueLesson';
import StackLesson from './pages/lessons/StackLesson';
import TreeLesson from './pages/lessons/TreeLesson';
import GraphLesson from './pages/lessons/GraphLesson';
import RecursionLesson from './pages/lessons/RecursionLesson';
import DynamicProgrammingLesson from './pages/lessons/DynamicProgrammingLesson';
import SortingLesson from './pages/lessons/SortingLesson';
import SearchingLesson from './pages/lessons/SearchingLesson';
import GreedyLesson from './pages/lessons/GreedyLesson';
import BigOLesson from './pages/lessons/BigOLesson';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/learn/array" element={<ArrayLesson />} />
      <Route path="/learn/linked-list" element={<LinkedListLesson />} />
      <Route path="/learn/queue" element={<QueueLesson />} />
      <Route path="/learn/stack" element={<StackLesson />} />
      <Route path="/learn/tree" element={<TreeLesson />} />
      <Route path="/learn/graph" element={<GraphLesson />} />
      <Route path="/learn/recursion" element={<RecursionLesson />} />
      <Route path="/learn/dynamic-programming" element={<DynamicProgrammingLesson />} />
      <Route path="/learn/sorting" element={<SortingLesson />} />
      <Route path="/learn/searching" element={<SearchingLesson />} />
      <Route path="/learn/greedy" element={<GreedyLesson />} />
      <Route path="/learn/big-o" element={<BigOLesson />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/quiz" element={<QuizHub />} />
      <Route path="/quiz/:topicId" element={<QuizPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/admin/feedback" element={<AdminFeedback />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="*" element={<ComingSoon title="Page not found" />} />
    </Routes>
  );
}
