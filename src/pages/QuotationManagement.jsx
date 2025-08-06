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
  Menu,X,User,LogOut
} from 'lucide-react';
import '../pages/pagestyle.css';
Link
import Enquiries from '../components/Enquiries';
import { Link } from 'react-router-dom';
import Quotations from '../components/Quotation';


const QuotationManagement = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);
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

  const handleLogout = () => {
    console.log('Logging out...');
    // Add logout logic
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
                <p className="user-name">John Admin</p>
                <p className="user-email">john@admin.com</p>
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
              <h1 className="page-title">Quatation Management</h1>
            </div>

            <div className="navbar-right">
              <div 
                className="profile-section"
                onMouseEnter={() => setShowProfileMenu(true)}
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <button className="profile-btn">
                  <div className="profile-info">
                    <p className="profile-name">John Doe</p>
                    <p className="profile-role">Administrator</p>
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
                    <button className="dropdown-item">
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    <button className="dropdown-item">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <hr className="dropdown-divider" />
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
    <Quotations/>
      </div>
    </div>
  );
};

export default QuotationManagement;
