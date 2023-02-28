import { BrowserRouter, Routes, Route } from "react-router-dom";
import GlobalStyle from "../src/themes/globalStyles";
import UserContext from "./context/UserContext";
import InitialPage from "./pages/InitialPage/index";
import ClienteRegister from "./pages/ClienteRegister";
import ClientesPage from "./pages/ClientesPage";
import ClienteUpdate from "./pages/ClienteUpdate";
import ProductRegister from "./pages/ProductRegister";
import ProductsPage from "./pages/ProductsPage";
import PurchaseRegister from "./pages/PurchaseRegister";
import ReportsPage from "./pages/ReportsPage";
import { useState } from "react";
import ClientePurchasesPage from "./pages/ClientePurchasesPage";
import Payment from "./pages/Payment";
import ClienteTransactions from "./pages/ClienteTransactions";
import StockPage from "./pages/StockPage";

export default function App(){
    const [info, setInfo] = useState();

    const userContext = {
        info,
        setInfo
    }

    return(
        <BrowserRouter>
            <GlobalStyle />
            <UserContext.Provider value={userContext}>
                <Routes>
                    <Route path="/" element={<InitialPage />} />
                    <Route path="/client/add" element={<ClienteRegister />} />
                    <Route path="/clients" element={<ClientesPage />} />
                    <Route path="/clients/:id/purchases" element={<ClientePurchasesPage />} />
                    <Route path="/clients/:id/transactions" element={<ClienteTransactions />} />
                    <Route path="/clients/:id/purchases/:purchaseId" element={<ReportsPage />} />
                    <Route path="/clients/:id/purchases/:purchaseId/payment" element={<Payment />} />
                    <Route path="/clients/update/:id" element={<ClienteUpdate />} />
                    <Route path="/products/add" element={<ProductRegister />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/purchases/:id" element={<PurchaseRegister />} />
                    <Route path="/relatorios" element={<StockPage />} />
                </Routes>
            </UserContext.Provider>
        </BrowserRouter>
    )
}
