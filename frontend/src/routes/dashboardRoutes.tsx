// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Dashboard from '../pages/dashborad/Dashboard'; // Adjust the import path
// import HomePage from '../pages/enterpreneur/HomePage';
// import FeedsPage from '../pages/enterpreneur/FeedsPage';
// import EventsPage from '../pages/enterpreneur/EventsPage';
// import MessagesPage from '../pages/enterpreneur/MessagesPage';
// import CreatePage from '../pages/enterpreneur/CreatePage';
// import NewsPage from '../pages/enterpreneur/NewsPage';
// import NotificationsPage from '../pages/enterpreneur/NotificationsPage';
// import InvestorsPage from '../pages/enterpreneur/InvestorsPage';
// import WalletsPage from '../pages/enterpreneur/WalletsPage';
// import Profile from '../pages/enterpreneur/profile';


// const DashboardRouter: React.FC = () => {
//     return (
//         <Routes>
//             <Route path="/dashboard" element={<Dashboard />}>
//                 <Route index element={<HomePage />} /> {/* Default route for /dashboard */}
//                 <Route path="home" element={<HomePage />} />
//                 <Route path="feeds" element={<FeedsPage />} />
//                 <Route path="events" element={<EventsPage />} />
//                 <Route path="messages" element={<MessagesPage />} />
//                 <Route path="create" element={<CreatePage />} />
//                 <Route path="news" element={<NewsPage />} />
//                 <Route path="notifications" element={<NotificationsPage />} />
//                 <Route path="investors" element={<InvestorsPage />} />
//                 <Route path="wallets" element={<WalletsPage />} />
//                 <Route path="profile" element={<Profile />} />
//             </Route>
//         </Routes>
//     );
// };

// export default DashboardRouter;


import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/dashborad/Dashboard'; // ✅ Fixed spelling
import HomePage from '../pages/enterpreneur/HomePage';
import FeedsPage from '../pages/enterpreneur/FeedsPage';
import EventCard from '../pages/enterpreneur/EventsCard';
import MessagesPage from '../pages/enterpreneur/MessagesPage';
import CreatePage from '../pages/enterpreneur/CreatePage';
import NotificationsPage from '../pages/enterpreneur/NotificationsPage';
import InvestorsPage from '../pages/enterpreneur/InvestorsPage';
import WalletsPage from '../pages/enterpreneur/WalletsPage';
import Profile from '../pages/enterpreneur/profile';
import NewsFeed from '../pages/basics/newsFeed';
import ProtectedRoute from '../routes/protectedRoute'; // ✅ Import the protected route
import EventCreation from '../pages/enterpreneur/EventCreation'
const DashboardRouter: React.FC = () => {
    return (
        <Routes>
            {/* Protecting the entire dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['entrepreneur', 'investor']} />}>
                <Route path="/dashboard" element={<Dashboard />}>
                    <Route index element={<HomePage />} />
                    <Route path="home" element={<HomePage />} />
                    <Route path="feeds" element={<FeedsPage />} />
                    <Route path="events" element={<EventCard />} />
                    <Route path="event-create" element={<EventCreation/>}/>
                    <Route path="messages" element={<MessagesPage />} />
                    <Route path="create" element={<CreatePage />} />
                    <Route path="news" element={<NewsFeed />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="investors" element={<InvestorsPage />} />
                    <Route path="wallets" element={<WalletsPage />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default DashboardRouter;
