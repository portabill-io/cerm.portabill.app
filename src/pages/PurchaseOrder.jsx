import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileSignature,
  ShoppingCart,
  Settings,
  Receipt,
  BarChart3,
  Users,
  Shield,
  Briefcase,
  ClipboardList,
  FileCheck2,
  Menu,
  X,
  User,
  LogOut
} from 'lucide-react';

import '../pages/pagestyle.css';

import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import Purchase from '../components/Purchase';

const PurchaseOrder = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    // Try to get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    } else {
      // If not in localStorage, try to fetch it
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserData(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Failed to fetch user data', error);
    }
  };

  const userRole = userData?.role || '';
  const userName = userData?.name || userData?.username || userData?.email?.split('@')[0] || 'User';

  const sidebarItems = [
    { icon: ClipboardList, label: 'Enquiries', href: '/enquirymanagement' },
    { icon: FileSignature, label: 'Quotations', href: '/quotationmanagement' },
    { icon: ShoppingCart, label: 'Purchase Orders', href: '/purchaseorders' },
    { icon: Briefcase, label: 'Job Orders', href: '/joborders' },
    { icon: FileCheck2, label: 'Invoices', href: '/invoices' },
    { icon: Receipt, label: 'Receipts', href: '/receipts' },
    { icon: BarChart3, label: 'Accounts Ledger', href: '/ledger' },
    { icon: Users, label: 'Clients', href: '/clients' },
    { icon: Shield, label: 'Users & Permissions', href: '/permissions' }
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      setShowProfileMenu(false);
      
      const token = localStorage.getItem('token');
      
      if (token) {
        await axios.post('/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Logout error:', error);
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      const errorMessage = error.response?.data?.message || 'Logout failed, but you have been signed out locally';
      toast.warn(errorMessage);
      navigate('/', { replace: true });
      
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="dashboard-container">
      {/* Mobile Overlay */}
      {!sidebarCollapsed && window.innerWidth <= 768 && (
        <div className="mobile-overlay" onClick={() => setSidebarCollapsed(true)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="header-content">
            {!sidebarCollapsed && <h2 className="logo">CERM System</h2>}
            <button onClick={toggleSidebar} className="collapse-btn">
              {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item, index) => (
            <Link key={index} to={item.href} className="nav-item">
              <item.icon size={20} className="nav-icon" />
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar"></div>
            {!sidebarCollapsed && (
              <div className="user-details">
                <p className="user-name">{userName}</p>
                <p className="user-email">{userData?.email || ''}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="navbar">
          <div className="navbar-content">
            <div className="navbar-left">
              <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <Menu size={20} />
              </button>
              <h1 className="page-title">Purchase Orders</h1>
            </div>

            <div className="navbar-right">
              <div 
                className="profile-section"
                onMouseEnter={() => setShowProfileMenu(true)}
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <button className="profile-btn">
                  <div className="profile-info">
                    <p className="profile-name">{userName}</p>
                  <p className="profile-role">{userRole}</p>
                  </div>
                  <div className="profile-avatar">
                    <User size={20} />
                  </div>
                </button>

                {showProfileMenu && (
                  <div 
                    className="profile-dropdown"
                    onMouseEnter={() => setShowProfileMenu(true)}
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item logout"
                      disabled={isLoggingOut}
                      style={{ 
                        opacity: isLoggingOut ? 0.6 : 1,
                        cursor: isLoggingOut ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <LogOut size={16} />
                      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <Purchase />
      </div>
    </div>
  );
};

export default PurchaseOrder;