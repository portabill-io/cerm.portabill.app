import React from 'react';
import './App.css';


import { Route, Routes } from 'react-router-dom';
import QuotationManagement from './pages/QuotationManagement';
import PurchaseOrder from './pages/PurchaseOrder';
import JobOrders from './pages/JobOrders';
import InvoiceManagement from './pages/InvoiceManagement';
import ReceiptManagement from './pages/ReceiptManagement';
import AccountsLedger from './pages/AccountsLedger ';
import ClientMaster from './pages/ClientMaster';
import UserAndPermissions from './pages/UserAndPermissions';
import EnquiryManagement from './pages/EnquiryManagement';
import Auth from './pages/Auth';

function App() {
  return (
    <div className="App">
     <Routes>
        <Route path='/' element={<EnquiryManagement />} />
       <Route path='/quotationmanagement' element={<QuotationManagement />} />
         <Route path='/purchaseorders' element={<PurchaseOrder/>} />
           <Route path='/joborders' element={<JobOrders/>} />
                 <Route path='/invoices' element={<InvoiceManagement/>} />
                      <Route path='/receipts' element={<ReceiptManagement/>} />
                        <Route path='/ledger' element={<AccountsLedger/>} />
                          <Route path='/clients' element={<ClientMaster/>} />
                            <Route path='/permissions' element={<UserAndPermissions/>} />
                             <Route path='/login' element={<Auth register={false} />} />
        <Route path='/register' element={<Auth register={true} />} />
      </Routes>
      
    </div>
  );
}

export default App;