import React, { useState } from 'react';
import { FaCreditCard, FaPlus, FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaHistory, FaEye } from 'react-icons/fa';
import {
  useGetCardsQuery,
  useGetUsersQuery,
  useGetBanksQuery,
  useGetFinanceCategoriesQuery,
  useGetTransactionsQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useGetCardTransactionsQuery,
  useCreateTransactionMutation,
  useVerifySecurityCodeAndGetCardMutation,
  useGetPendingSettlementsQuery,
  useSettleTransactionMutation,
} from '../../../api/services NodeJs/financialCardsApi';
import '../../../styles/financialCards.css';

const FinancialCards = () => {
  const [showCardModal, setShowCardModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showSecurityCodeModal, setShowSecurityCodeModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [securityCode, setSecurityCode] = useState('');
  const [decryptedCards, setDecryptedCards] = useState({}); // Store decrypted card data by card ID
  const [securityCodeError, setSecurityCodeError] = useState('');
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [selectedTransactionIds, setSelectedTransactionIds] = useState([]);
  const [settlementDescription, setSettlementDescription] = useState('');
  const [settlementImage, setSettlementImage] = useState(null);
  const [settlementFilter, setSettlementFilter] = useState('all'); // 'all', 'card', 'amount'
  const [settlementSearch, setSettlementSearch] = useState('');
  const [cardFormData, setCardFormData] = useState({
    no: '',
    cvc: '',
    card_holder: '',
    exp_date: '',
    category: '',
    user: '',
    limitation: 0,
    amount: 0,
    bank_id: '',
  });

  const { data: cardsData, isLoading: cardsLoading, refetch: refetchCards } = useGetCardsQuery();
  const { data: usersData } = useGetUsersQuery();
  const { data: banksData } = useGetBanksQuery();
  const { data: categoriesData } = useGetFinanceCategoriesQuery();
  const { data: allTransactionsData } = useGetTransactionsQuery();
  const [createCard, { isLoading: creatingCard }] = useCreateCardMutation();
  const [updateCard, { isLoading: updatingCard }] = useUpdateCardMutation();
  const [deleteCard] = useDeleteCardMutation();
  const [createTransaction, { isLoading: creatingTransaction }] = useCreateTransactionMutation();
  const [verifySecurityCode] = useVerifySecurityCodeAndGetCardMutation();
  const { data: pendingSettlementsData, refetch: refetchSettlements } = useGetPendingSettlementsQuery();
  const [settleTransaction, { isLoading: isSettling }] = useSettleTransactionMutation();

  const cards = cardsData || [];
  const users = usersData || [];
  const banks = banksData || [];
  const categories = categoriesData || [];
  const allTransactions = allTransactionsData || [];
  const pendingSettlements = pendingSettlementsData || [];

  const { data: transactionsData } = useGetCardTransactionsQuery(selectedCard?.id, {
    skip: !selectedCard,
  });
  const transactions = transactionsData || [];

  const handleOpenCardModal = (card = null) => {
    if (card) {
      setEditingCard(card);
      
      // Format exp_date for date input (yyyy-MM-dd)
      let formattedExpDate = '';
      if (card.exp_date) {
        try {
          const date = new Date(card.exp_date);
          if (!isNaN(date.getTime())) {
            formattedExpDate = date.toISOString().split('T')[0];
          }
        } catch (e) {
          // If it's already in yyyy-MM-dd format, use it as is
          formattedExpDate = card.exp_date.split('T')[0] || card.exp_date;
        }
      }
      
      // Check if card number is in old encrypted format (hex without colons)
      const isOldEncryptedFormat = (value) => {
        if (!value) return false;
        const cleaned = value.replace(/\s/g, '');
        // Old format: hex string without colons, length > 20
        return /^[0-9a-f]+$/i.test(cleaned) && cleaned.length > 20 && !value.includes(':');
      };
      
      // If card number is in old encrypted format, clear it (user needs to re-enter)
      const cardNo = (card.no && !isOldEncryptedFormat(card.no) && card.no !== '**** **** **** ****' && card.no !== 'N/A') 
        ? card.no 
        : '';
      const cardCvc = (card.cvc && !isOldEncryptedFormat(card.cvc) && card.cvc !== '***' && card.cvc !== 'N/A') 
        ? card.cvc 
        : '';
      
      // Show alert if old encrypted format detected
      if (isOldEncryptedFormat(card.no) || isOldEncryptedFormat(card.cvc)) {
        setTimeout(() => {
          alert('This card has old encrypted data. Please re-enter the card number and CVC to update it with the new encryption format.');
        }, 100);
      }
      
      setCardFormData({
        no: cardNo,
        cvc: cardCvc,
        card_holder: card.card_holder || '',
        exp_date: formattedExpDate,
        category: card.category ? String(card.category) : '',
        user: card.user ? String(card.user) : '',
        limitation: card.limitation || 0,
        amount: card.amount || 0,
        bank_id: card.bank_id ? String(card.bank_id) : '',
      });
    } else {
      setEditingCard(null);
      setCardFormData({
        no: '',
        cvc: '',
        card_holder: '',
        exp_date: '',
        category: '',
        user: '',
        limitation: 0,
        amount: 0,
        bank_id: '',
      });
    }
    setShowCardModal(true);
  };

  const handleCloseCardModal = () => {
    setShowCardModal(false);
    setEditingCard(null);
      setCardFormData({
        no: '',
        cvc: '',
        card_holder: '',
        exp_date: '',
        category: '',
        user: '',
        limitation: 0,
        amount: 0,
        bank_id: '',
      });
  };

  const handleSubmitCard = async (e) => {
    e.preventDefault();
    
    // Validate card number (if provided)
    if (cardFormData.no) {
      const cardNo = cardFormData.no.replace(/\s/g, ''); // Remove spaces
      if (!/^\d{13,19}$/.test(cardNo)) {
        alert('Card number must be between 13 and 19 digits');
        return;
      }
    }
    
    // Validate CVC (if provided)
    if (cardFormData.cvc) {
      const cvc = cardFormData.cvc.trim();
      if (!/^\d{3,4}$/.test(cvc)) {
        alert('CVC must be 3 or 4 digits');
        return;
      }
    }
    
    try {
      // Clean card number (remove spaces) before sending
      const cleanedCardNo = cardFormData.no ? cardFormData.no.replace(/\s/g, '') : null;
      
      const cardData = {
        ...cardFormData,
        no: cleanedCardNo,
        cvc: cardFormData.cvc ? cardFormData.cvc.trim() : null,
        category: cardFormData.category ? parseInt(cardFormData.category) : null,
        user: cardFormData.user || null,
        limitation: parseFloat(cardFormData.limitation) || 0,
        amount: parseFloat(cardFormData.amount) || 0,
        bank_id: cardFormData.bank_id ? parseInt(cardFormData.bank_id) : null,
      };

      if (editingCard) {
        await updateCard({ id: editingCard.id, ...cardData }).unwrap();
      } else {
        await createCard(cardData).unwrap();
      }
      handleCloseCardModal();
      refetchCards();
    } catch (error) {
      alert(error?.data?.message || 'Failed to save card');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to deactivate this card?')) {
      try {
        await deleteCard(cardId).unwrap();
        refetchCards();
      } catch (error) {
        alert(error?.data?.message || 'Failed to delete card');
      }
    }
  };

  const handleViewCardDetails = (card) => {
    // Check if we already have decrypted data for this card
    if (decryptedCards[card.id]) {
      setSelectedCard(decryptedCards[card.id]);
      setShowCardDetails(true);
    } else {
      // Show security code modal first
      setSelectedCard(card);
      setShowSecurityCodeModal(true);
    }
  };

  const handleVerifySecurityCode = async () => {
    if (!selectedCard || !securityCode || securityCode.length !== 4) {
      setSecurityCodeError('Please enter a valid 4-digit security code');
      return;
    }

    // Clear any previous error
    setSecurityCodeError('');

    try {
      const result = await verifySecurityCode({
        card_id: selectedCard.id,
        security_code: securityCode,
      }).unwrap();

      if (result.status === 'success' && result.data) {
        // Store decrypted card data
        setDecryptedCards((prev) => ({
          ...prev,
          [selectedCard.id]: result.data,
        }));
        setSelectedCard(result.data);
        setShowSecurityCodeModal(false);
        setSecurityCode('');
        setSecurityCodeError('');
        setShowCardDetails(true);
      }
    } catch (error) {
      setSecurityCodeError(error?.data?.message || 'Invalid security code. Please try again.');
      setSecurityCode('');
    }
  };

  const handleCloseCardDetails = () => {
    setShowCardDetails(false);
    setSelectedCard(null);
  };

  const handleOpenTransactionModal = (card, type) => {
    setSelectedCard(card);
    setTransactionType(type);
    setTransactionFormData({
      amount: '',
      description: '',
      image: null,
    });
    setShowTransactionModal(true);
  };

  const [transactionType, setTransactionType] = useState('add');
  const [transactionFormData, setTransactionFormData] = useState({
    amount: '',
    description: '',
    image: null,
  });

  const handleCloseTransactionModal = () => {
    setShowTransactionModal(false);
    setSelectedCard(null);
    setTransactionFormData({
      amount: '',
      description: '',
      image: null,
    });
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    if (!selectedCard) return;

    try {
      const formData = new FormData();
      formData.append('card', selectedCard.id);
      formData.append('type', transactionType);
      formData.append('amount', transactionFormData.amount);
      formData.append('description', transactionFormData.description);
      if (transactionFormData.image) {
        formData.append('image', transactionFormData.image);
      }

      // For now, send as JSON (image upload can be handled separately if needed)
      await createTransaction({
        card: selectedCard.id,
        type: transactionType,
        amount: parseFloat(transactionFormData.amount),
        description: transactionFormData.description,
        image: transactionFormData.image ? transactionFormData.image.name : null,
      }).unwrap();

      handleCloseTransactionModal();
      if (showCardDetails) {
        // Refetch transactions
        refetchCards();
      }
    } catch (error) {
      alert(error?.data?.message || 'Failed to create transaction');
    }
  };

  // Calculate card balance
  const calculateBalance = (cardId) => {
    // Use allTransactions for card list, transactions for details view
    const transactionsToUse = selectedCard && selectedCard.id === cardId ? transactions : allTransactions;
    const cardTransactions = transactionsToUse.filter((t) => t.card === cardId || t.card === parseInt(cardId));
    return cardTransactions.reduce((balance, transaction) => {
      if (transaction.type === 'add') {
        return balance + (parseFloat(transaction.amount) || 0);
      } else if (transaction.type === 'use') {
        return balance - (parseFloat(transaction.amount) || 0);
      }
      return balance;
    }, 0);
  };

  const handleOpenSettlementModal = (settlement, singleTransactionId = null) => {
    setSelectedSettlement(settlement);
    
    if (singleTransactionId) {
      // Settle single transaction
      const transaction = settlement.transactions.find(t => t.id === singleTransactionId);
      if (transaction) {
        setSettlementAmount(parseFloat(transaction.amount || 0).toFixed(2));
        setSelectedTransactionIds([singleTransactionId]);
      }
    } else {
      // Settle all transactions for the card
      setSettlementAmount(settlement.total_to_settle.toFixed(2));
      setSelectedTransactionIds(settlement.transactions.map(t => t.id));
    }
    
    setShowSettlementModal(true);
  };

  const handleCloseSettlementModal = () => {
    setShowSettlementModal(false);
    setSelectedSettlement(null);
    setSettlementAmount('');
    setSelectedTransactionIds([]);
    setSettlementDescription('');
    setSettlementImage(null);
  };

  const handleToggleTransaction = (transactionId) => {
    setSelectedTransactionIds(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  const handleSettle = async (e) => {
    e.preventDefault();
    if (!selectedSettlement || !settlementAmount || parseFloat(settlementAmount) <= 0) {
      alert('Please enter a valid settlement amount');
      return;
    }

    if (selectedTransactionIds.length === 0) {
      alert('Please select at least one transaction to settle');
      return;
    }

    try {
      await settleTransaction({
        card_id: selectedSettlement.card_id,
        transaction_ids: selectedTransactionIds,
        settlement_amount: parseFloat(settlementAmount),
      }).unwrap();
      
      // Create a topup transaction for the settlement amount (marked as settlement)
      await createTransaction({
        card: selectedSettlement.card_id,
        type: 'add',
        amount: parseFloat(settlementAmount),
        description: settlementDescription || `Settlement for ${selectedTransactionIds.length} transaction(s)`,
        image: settlementImage ? settlementImage.name : null,
        is_settlement: true,
      }).unwrap();
      
      refetchCards();
      refetchSettlements();
      handleCloseSettlementModal();
      alert('Transactions settled successfully!');
    } catch (error) {
      console.error('Error settling transactions:', error);
      alert('Error settling transactions: ' + (error.data?.message || error.message || 'Unknown error'));
    }
  };

  return (
    <div className="financial-cards-container">
      <div className="financial-cards-header">
        <h1>Financial Cards Management</h1>
        <button className="btn-primary-financial-cards" onClick={() => handleOpenCardModal()}>
          <FaPlus /> Add New Card
        </button>
      </div>

      {cardsLoading ? (
        <div className="loading-financial-cards">Loading cards...</div>
      ) : (
        <div className="cards-grid-financial-cards">
          {cards.map((card) => {
            const balance = parseFloat(card.amount || 0);
            // By default, use masked values from backend (card.no and card.cvc are already masked)
            // Only use decrypted values if security code was verified
            const hasDecryptedData = decryptedCards[card.id];
            let displayCardNo = hasDecryptedData ? decryptedCards[card.id].no : (card.no || 'N/A');
            const displayCvc = hasDecryptedData ? decryptedCards[card.id].cvc : (card.cvc || '***');
            
            // Format card number
            let formattedCardNo = 'N/A';
            if (displayCardNo && displayCardNo !== 'N/A') {
              if (hasDecryptedData) {
                // Decrypted value - format with spaces every 4 digits
                formattedCardNo = displayCardNo.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
              } else {
                // Masked value from backend - use as is (should already be formatted like "**** **** **** 1234")
                formattedCardNo = displayCardNo.includes('*') ? displayCardNo : '**** **** **** ' + displayCardNo.slice(-4);
              }
            }
            
            const expDate = card.exp_date ? new Date(card.exp_date).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : 'N/A';
            const isFlipped = flippedCardId === card.id;
            return (
              <div key={card.id} className="card-item-financial-cards">
                <div 
                  className={`bank-card-container-financial-cards ${isFlipped ? 'flipped-financial-cards' : ''}`}
                  onClick={(e) => {
                    // Don't flip if clicking on buttons or chip
                    if (!e.target.closest('.bank-card-actions-financial-cards') && 
                        !e.target.closest('.bank-card-chip-financial-cards')) {
                      setFlippedCardId(isFlipped ? null : card.id);
                    }
                  }}
                >
                  <div className="bank-card-inner-financial-cards">
                    {/* Front Side */}
                    <div className="bank-card-front-financial-cards">
                  <div className="bank-card-header-financial-cards">
                    <div 
                      className="bank-card-chip-financial-cards"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewCardDetails(card);
                      }}
                      title="View Card Details"
                    >
                      <div className="chip-financial-cards"></div>
                    </div>
                    <div className="bank-card-actions-financial-cards" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn-card-icon-financial-cards btn-card-topup-financial-cards"
                            onClick={() => handleOpenTransactionModal(card, 'add')}
                            title="Topup Card"
                          >
                            <FaArrowUp />
                          </button>
                          <button
                            className="btn-card-icon-financial-cards btn-card-history-financial-cards"
                            onClick={() => handleViewCardDetails(card)}
                            title="View History"
                          >
                            <FaHistory />
                          </button>
                          <button
                            className="btn-card-icon-financial-cards"
                            onClick={() => handleOpenCardModal(card)}
                            title="Edit Card"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-card-icon-financial-cards btn-card-danger-financial-cards"
                            onClick={() => handleDeleteCard(card.id)}
                            title="Deactivate Card"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <div className="bank-card-number-financial-cards">
                        {formattedCardNo}
                      </div>
                      <div className="bank-card-details-financial-cards">
                        <div className="bank-card-holder-financial-cards">
                          <div className="bank-card-label-financial-cards">CARD HOLDER</div>
                          <div className="bank-card-value-financial-cards">{card.card_holder || 'N/A'}</div>
                        </div>
                        <div className="bank-card-expiry-financial-cards">
                          <div className="bank-card-label-financial-cards">EXPIRES</div>
                          <div className="bank-card-value-financial-cards">{expDate}</div>
                        </div>
                      </div>
                      <div className="bank-card-footer-financial-cards">
                        <div className="bank-card-bank-financial-cards">{card.bank_name || 'BANK'}</div>
                        <div className={`bank-card-balance-financial-cards ${balance >= 0 ? 'positive-financial-cards' : 'negative-financial-cards'}`}>
                          LKR {balance.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Back Side */}
                    <div className="bank-card-back-financial-cards">
                      <div className="bank-card-back-stripe-financial-cards"></div>
                      <div className="bank-card-back-cvc-financial-cards">
                        <div className="bank-card-back-label-financial-cards">CVC</div>
                        <div className="bank-card-back-cvc-value-financial-cards">{displayCvc}</div>
                      </div>
                      <div className="bank-card-back-footer-financial-cards">
                        <div className="bank-card-back-signature-financial-cards">
                          <div className="bank-card-back-signature-label-financial-cards">AUTHORIZED SIGNATURE</div>
                          <div className="bank-card-back-signature-box-financial-cards"></div>
                        </div>
                        <div className="bank-card-back-bank-financial-cards">{card.bank_name || 'BANK'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pending Settlements Section - Table View */}
      {pendingSettlements.length > 0 && (() => {
        // Flatten all transactions from all settlements into a single list
        const allSettlementTransactions = [];
        pendingSettlements.forEach(settlement => {
          settlement.transactions.forEach(transaction => {
            allSettlementTransactions.push({
              ...transaction,
              card_id: settlement.card_id,
              card_holder: settlement.card_holder,
              card_number: settlement.card_number,
              current_amount: settlement.current_amount,
              total_to_settle: settlement.total_to_settle,
              settlement: settlement, // Keep reference to full settlement object
            });
          });
        });

        // Filter: Only show approved transactions (approved: 1) and use type
        let filteredTransactions = allSettlementTransactions.filter(t => 
          t.approved === 1 && t.type === 'use'
        );
        
        // Apply search filter
        if (settlementSearch) {
          const searchLower = settlementSearch.toLowerCase();
          filteredTransactions = filteredTransactions.filter(t => 
            t.card_holder?.toLowerCase().includes(searchLower) ||
            t.card_number?.toLowerCase().includes(searchLower) ||
            t.description?.toLowerCase().includes(searchLower) ||
            t.amount?.toString().includes(searchLower)
          );
        }

        // Group by card for display
        const transactionsByCard = {};
        filteredTransactions.forEach(transaction => {
          if (!transactionsByCard[transaction.card_id]) {
            transactionsByCard[transaction.card_id] = {
              card_id: transaction.card_id,
              card_holder: transaction.card_holder,
              card_number: transaction.card_number,
              current_amount: transaction.current_amount,
              transactions: [],
              total_to_settle: 0,
            };
          }
          transactionsByCard[transaction.card_id].transactions.push(transaction);
          transactionsByCard[transaction.card_id].total_to_settle += parseFloat(transaction.amount || 0);
        });

        const filteredSettlements = Object.values(transactionsByCard);

        return (
          <div className="pending-settlements-section-financial-cards">
            <div className="settlements-header-financial-cards">
              <h2 className="settlements-title-financial-cards">
                <span className="settlements-icon-financial-cards">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="#004B71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 4L6 4L4 6" stroke="#004B71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#004B71"/>
                    <path d="M20 4L18 4L20 6" stroke="#004B71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#004B71"/>
                    <path d="M4 20L6 20L4 18" stroke="#004B71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#004B71"/>
                    <path d="M20 20L18 20L20 18" stroke="#004B71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#004B71"/>
                  </svg>
                </span>
                Transactions to Settle
              </h2>
              <div className="settlements-filters-financial-cards">
                <input
                  type="text"
                  placeholder="Search by card holder, card number, description, or amount..."
                  value={settlementSearch}
                  onChange={(e) => setSettlementSearch(e.target.value)}
                  className="settlement-search-input-financial-cards"
                />
              </div>
            </div>
            
            {filteredSettlements.length === 0 ? (
              <div className="no-settlements-financial-cards">
                <p>No pending settlements found</p>
              </div>
            ) : (
              <div className="settlements-table-container-financial-cards">
                <table className="settlements-table-financial-cards">
                  <thead>
                    <tr>
                      <th>Card Holder</th>
                      <th>Card Number</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Approved</th>
                      <th>Approved By</th>
                      <th>Settlement Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSettlements.map((settlement) => (
                      <React.Fragment key={settlement.card_id}>
                        {settlement.transactions.map((transaction, index) => (
                          <tr key={transaction.id} className={index === 0 ? 'first-transaction-row-financial-cards' : ''}>
                            {index === 0 && (
                              <>
                                <td rowSpan={settlement.transactions.length} className="card-info-cell-financial-cards">
                                  <div className="card-info-financial-cards">
                                    <strong>{settlement.card_holder || 'N/A'}</strong>
                                  </div>
                                </td>
                                <td rowSpan={settlement.transactions.length} className="card-info-cell-financial-cards">
                                  <div className="card-info-financial-cards">
                                    {settlement.card_number || 'N/A'}
                                  </div>
                                </td>
                              </>
                            )}
                            <td>{new Date(transaction.date).toLocaleDateString()}</td>
                            <td>{transaction.time || 'N/A'}</td>
                            <td className="amount-cell-financial-cards">LKR {parseFloat(transaction.amount || 0).toFixed(2)}</td>
                            <td>{transaction.description || 'N/A'}</td>
                            <td>
                              {transaction.approved === 1 ? (
                                <span style={{ color: '#28a745', fontWeight: '600' }}>Approved</span>
                              ) : transaction.approved === 2 ? (
                                <span style={{ color: '#dc3545', fontWeight: '600' }}>Rejected</span>
                              ) : (
                                <span style={{ color: '#ffc107', fontWeight: '600' }}>Pending</span>
                              )}
                            </td>
                            <td>{transaction.approved_by_name || 'N/A'}</td>
                            <td className="amount-cell-financial-cards">
                              <strong className="settlement-total-amount-financial-cards">
                                LKR {parseFloat(transaction.amount || 0).toFixed(2)}
                              </strong>
                            </td>
                            <td>
                              <button
                                className="settle-button-table-financial-cards"
                                onClick={() => handleOpenSettlementModal(settlement, transaction.id)}
                                disabled={isSettling}
                              >
                                {isSettling ? 'Settling...' : 'Settle'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* Card Modal */}
      {showCardModal && (
        <div className="modal-overlay-financial-cards" onClick={handleCloseCardModal}>
          <div className="modal-content-financial-cards" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-financial-cards">
              <h2>{editingCard ? 'Edit Card' : 'Add New Card'}</h2>
              <button className="modal-close-financial-cards" onClick={handleCloseCardModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitCard} className="modal-form-financial-cards" autoComplete="off" noValidate>
              <div className="form-group-financial-cards">
                <label>Card Number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={cardFormData.no}
                  onChange={(e) => {
                    // Allow only digits and spaces, format with spaces every 4 digits
                    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    // Add space every 4 digits
                    value = value.match(/.{1,4}/g)?.join(' ') || value;
                    setCardFormData({ ...cardFormData, no: value });
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19} // 16 digits + 3 spaces
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  name="card-no-input"
                  id="card-no-input"
                />
                {cardFormData.no && cardFormData.no.replace(/\s/g, '').length > 0 && 
                 cardFormData.no.replace(/\s/g, '').length < 13 && (
                  <small style={{ color: '#dc3545', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
                    Card number must be 13-19 digits
                  </small>
                )}
              </div>
              <div className="form-group-financial-cards">
                <label>CVC</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={cardFormData.cvc}
                  onChange={(e) => {
                    // Allow only digits, max 4 characters
                    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setCardFormData({ ...cardFormData, cvc: value });
                  }}
                  placeholder="123"
                  maxLength={4}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  name="cvc-field"
                  id="cvc-field"
                />
                {cardFormData.cvc && cardFormData.cvc.length > 0 && 
                 cardFormData.cvc.length < 3 && (
                  <small style={{ color: '#dc3545', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
                    CVC must be 3 or 4 digits
                  </small>
                )}
              </div>
              <div className="form-group-financial-cards">
                <label>Card Holder</label>
                <input
                  type="text"
                  value={cardFormData.card_holder}
                  onChange={(e) => setCardFormData({ ...cardFormData, card_holder: e.target.value })}
                  placeholder="Enter card holder name"
                />
              </div>
              <div className="form-group-financial-cards">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={cardFormData.exp_date}
                  onChange={(e) => setCardFormData({ ...cardFormData, exp_date: e.target.value })}
                />
              </div>
              <div className="form-group-financial-cards">
                <label>Category</label>
                <select
                  value={cardFormData.category}
                  onChange={(e) => setCardFormData({ ...cardFormData, category: e.target.value })}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group-financial-cards">
                <label>Bank</label>
                <select
                  value={cardFormData.bank_id}
                  onChange={(e) => setCardFormData({ ...cardFormData, bank_id: e.target.value })}
                >
                  <option value="">-- Select Bank --</option>
                  {banks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group-financial-cards">
                <label>User (Optional)</label>
                <select
                  value={cardFormData.user}
                  onChange={(e) => setCardFormData({ ...cardFormData, user: e.target.value })}
                >
                  <option value="">-- No User --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group-financial-cards">
                <label>Limitation</label>
                <input
                  type="number"
                  step="0.01"
                  value={cardFormData.limitation}
                  onChange={(e) => setCardFormData({ ...cardFormData, limitation: e.target.value })}
                  placeholder="Enter limitation amount"
                />
              </div>
              <div className="form-group-financial-cards">
                <label>Amount (Initial Balance)</label>
                <input
                  type="number"
                  step="0.01"
                  value={cardFormData.amount}
                  onChange={(e) => setCardFormData({ ...cardFormData, amount: e.target.value })}
                  placeholder="Enter initial amount"
                />
              </div>
              <div className="modal-actions-financial-cards">
                <button type="button" className="btn-cancel-financial-cards" onClick={handleCloseCardModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-financial-cards" disabled={creatingCard || updatingCard}>
                  {creatingCard || updatingCard ? 'Saving...' : editingCard ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && selectedCard && (
        <div className="modal-overlay-financial-cards" onClick={handleCloseTransactionModal}>
          <div className="modal-content-financial-cards" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-financial-cards">
              <h2>{transactionType === 'add' ? 'Topup Card' : 'Spend from Card'}</h2>
              <button className="modal-close-financial-cards" onClick={handleCloseTransactionModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitTransaction} className="modal-form-financial-cards">
              <div className="form-group-financial-cards">
                <label>Card</label>
                <input type="text" value={selectedCard.no || 'N/A'} disabled />
              </div>
              <div className="form-group-financial-cards">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionFormData.amount}
                  onChange={(e) => setTransactionFormData({ ...transactionFormData, amount: e.target.value })}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="form-group-financial-cards">
                <label>Transaction Slip No (Description)</label>
                <input
                  type="text"
                  value={transactionFormData.description}
                  onChange={(e) => setTransactionFormData({ ...transactionFormData, description: e.target.value })}
                  placeholder="Enter transaction slip number"
                  required
                />
              </div>
              <div className="form-group-financial-cards">
                <label>Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTransactionFormData({ ...transactionFormData, image: e.target.files[0] })}
                />
              </div>
              <div className="modal-actions-financial-cards">
                <button type="button" className="btn-cancel-financial-cards" onClick={handleCloseTransactionModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-financial-cards" disabled={creatingTransaction}>
                  {creatingTransaction ? 'Processing...' : transactionType === 'add' ? 'Topup' : 'Spend'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Code Modal - Compact & Modern */}
      {showSecurityCodeModal && selectedCard && (
        <div className="modal-overlay-financial-cards security-code-overlay-financial-cards" onClick={() => { setShowSecurityCodeModal(false); setSecurityCode(''); setSecurityCodeError(''); }}>
          <div className="security-code-modal-financial-cards" onClick={(e) => e.stopPropagation()}>
            <div className="security-code-header-financial-cards">
              <div className="security-code-icon-financial-cards">🔒</div>
              <h3>Security Code</h3>
              <button className="security-code-close-financial-cards" onClick={() => { setShowSecurityCodeModal(false); setSecurityCode(''); setSecurityCodeError(''); }}>
                ×
              </button>
            </div>
            <div className="security-code-body-financial-cards">
              <p className="security-code-hint-financial-cards">Enter 4-digit code</p>
              <div className="security-code-input-wrapper-financial-cards">
                <input
                  type="tel"
                  inputMode="numeric"
                  value={securityCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setSecurityCode(value);
                    // Clear error when user starts typing
                    if (securityCodeError) {
                      setSecurityCodeError('');
                    }
                  }}
                  placeholder="••••"
                  maxLength={4}
                  autoComplete="off"
                  autoFocus
                  className={`security-code-input-financial-cards ${securityCodeError ? 'error-financial-cards' : ''}`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && securityCode.length === 4) {
                      handleVerifySecurityCode();
                    }
                  }}
                />
                <div className="security-code-dots-financial-cards">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={securityCode.length > i ? 'filled-financial-cards' : ''}></span>
                  ))}
                </div>
                {securityCodeError && (
                  <div className="security-code-error-financial-cards">
                    {securityCodeError}
                  </div>
                )}
              </div>
              <button
                className="security-code-verify-btn-financial-cards"
                onClick={handleVerifySecurityCode}
                disabled={securityCode.length !== 4}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Details Modal */}
      {showCardDetails && selectedCard && (
        <div className="modal-overlay-financial-cards" onClick={handleCloseCardDetails}>
          <div className="modal-content-financial-cards modal-large-financial-cards" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-financial-cards">
              <h2>Card Details & Transaction History</h2>
              <button className="modal-close-financial-cards" onClick={handleCloseCardDetails}>
                ×
              </button>
            </div>
            <div className="card-details-financial-cards">
              <div className="card-details-info-financial-cards">
                <h3>Card Information</h3>
                <div className="details-grid-financial-cards">
                  <div className="detail-item-financial-cards">
                    <label>Card Number:</label>
                    <span>{selectedCard.no ? selectedCard.no.replace(/(.{4})/g, '$1 ').trim() : 'N/A'}</span>
                  </div>
                  <div className="detail-item-financial-cards">
                    <label>CVC:</label>
                    <span>{selectedCard.cvc || '***'}</span>
                  </div>
                  <div className="detail-item-financial-cards">
                    <label>Card Holder:</label>
                    <span>{selectedCard.card_holder || 'N/A'}</span>
                  </div>
                  <div className="detail-item-financial-cards">
                    <label>User:</label>
                    <span>{selectedCard.user_name || selectedCard.user_email || 'Not Assigned'}</span>
                  </div>
                  <div className="detail-item-financial-cards">
                    <label>Category:</label>
                    <span>{selectedCard.category_name || selectedCard.category || 'N/A'}</span>
                  </div>
                  <div className="detail-item-financial-cards">
                    <label>Bank:</label>
                    <span>{selectedCard.bank_name || 'N/A'}</span>
                  </div>
                  <div className="detail-item-financial-cards">
                    <label>Balance:</label>
                    <span className={`balance-financial-cards ${parseFloat(selectedCard.amount || 0) >= 0 ? 'positive-financial-cards' : 'negative-financial-cards'}`}>
                      {parseFloat(selectedCard.amount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="detail-item-financial-cards">
                    <label>Limit:</label>
                    <span>{parseFloat(selectedCard.limitation || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="card-transactions-financial-cards">
                <h3>Transaction History</h3>
                <div className="transactions-table-financial-cards">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="no-transactions-financial-cards">
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction) => {
                          // Format date
                          let formattedDate = 'N/A';
                          if (transaction.date) {
                            try {
                              const date = new Date(transaction.date);
                              formattedDate = date.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: '2-digit', 
                                day: '2-digit' 
                              });
                            } catch (e) {
                              formattedDate = transaction.date;
                            }
                          }
                          
                          // Format time
                          let formattedTime = 'N/A';
                          try {
                            if (transaction.time) {
                              const timeStr = transaction.time.includes('T') 
                                ? transaction.time.split('T')[1]?.split('.')[0] || transaction.time
                                : transaction.time;
                              const [hours, minutes] = timeStr.split(':');
                              const timeDate = new Date(2000, 0, 1, parseInt(hours) || 0, parseInt(minutes) || 0);
                              formattedTime = timeDate.toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                              });
                            } else if (transaction.date) {
                              const date = new Date(transaction.date);
                              formattedTime = date.toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                              });
                            }
                          } catch (e) {
                            formattedTime = transaction.time || 'N/A';
                          }
                          
                          return (
                            <tr key={transaction.id}>
                              <td>{formattedDate}</td>
                              <td>{formattedTime}</td>
                              <td>
                                <span className={`transaction-type-financial-cards ${transaction.type}`}>
                                  {transaction.type === 'add' ? 'Topup' : 'Spend'}
                                </span>
                              </td>
                              <td className={transaction.type === 'add' ? 'amount-positive-financial-cards' : 'amount-negative-financial-cards'}>
                                {transaction.type === 'add' ? '+' : '-'}{parseFloat(transaction.amount || 0).toFixed(2)}
                              </td>
                              <td>{transaction.description || transaction.descriprion || 'N/A'}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settlement Modal */}
      {showSettlementModal && selectedSettlement && (
        <div className="modal-overlay-financial-cards" onClick={handleCloseSettlementModal}>
          <div className="modal-content-financial-cards" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-financial-cards">
              <h2>Settle Transactions</h2>
              <button className="modal-close-financial-cards" onClick={handleCloseSettlementModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSettle} className="modal-form-financial-cards">
              <div className="form-group-financial-cards">
                <label>Card</label>
                <input 
                  type="text" 
                  value={`${selectedSettlement.card_holder || 'N/A'} - ${selectedSettlement.card_number || 'N/A'}`} 
                  disabled 
                />
              </div>
              
              <div className="form-group-financial-cards">
                <label className="settlement-transactions-label-financial-cards">
                  <span className="settlement-transactions-icon-financial-cards">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="#004B71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 4L6 4L4 6" stroke="#004B71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#004B71"/>
                      <path d="M20 4L18 4L20 6" stroke="#004B71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#004B71"/>
                      <path d="M4 20L6 20L4 18" stroke="#004B71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#004B71"/>
                      <path d="M20 20L18 20L20 18" stroke="#004B71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#004B71"/>
                    </svg>
                  </span>
                  Transactions to Settle
                </label>
                <div className="settlement-transactions-list-financial-cards">
                  {selectedSettlement.transactions
                    .filter(t => selectedTransactionIds.includes(t.id))
                    .map(transaction => (
                      <div key={transaction.id} className="settlement-transaction-item-financial-cards">
                        <div className="settlement-transaction-content-financial-cards">
                          <div>
                            <strong>{new Date(transaction.date).toLocaleDateString()}</strong> - {transaction.description || 'N/A'}
                          </div>
                          <div className="settlement-transaction-amount-financial-cards">
                            LKR {parseFloat(transaction.amount || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="form-group-financial-cards">
                <label>Settlement Amount (Topup Amount)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                  placeholder="Enter settlement amount"
                  required
                  min="0.01"
                />
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  This amount will be added to the card as a topup transaction
                </small>
              </div>

              <div className="form-group-financial-cards">
                <label>Transaction Slip No (Description)</label>
                <input
                  type="text"
                  value={settlementDescription}
                  onChange={(e) => setSettlementDescription(e.target.value)}
                  placeholder="Enter transaction slip number or description"
                  required
                />
              </div>

              <div className="form-group-financial-cards">
                <label>Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSettlementImage(e.target.files[0] || null)}
                />
                {settlementImage && (
                  <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                    Selected: {settlementImage.name}
                  </small>
                )}
              </div>

              <div style={{ 
                padding: '12px', 
                backgroundColor: '#e8f4f8', 
                borderRadius: '8px', 
                marginBottom: '16px',
                border: '1px solid #004B71'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>Total Transactions:</strong>
                  <span>{selectedTransactionIds.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>Total Amount:</strong>
                  <span>LKR {selectedSettlement.transactions
                    .filter(t => selectedTransactionIds.includes(t.id))
                    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
                    .toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: '#004B71' }}>
                  <strong>Settlement Amount:</strong>
                  <span>LKR {parseFloat(settlementAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="modal-actions-financial-cards">
                <button type="button" className="btn-cancel-financial-cards" onClick={handleCloseSettlementModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-financial-cards" disabled={isSettling}>
                  {isSettling ? 'Settling...' : 'Settle & Topup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialCards;

