import React, { Suspense, lazy, useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Bars } from 'react-loader-spinner';
import UsersDirectory from './Users';
import '../../../styles/userManagement.css';

const LazyUsersRegisterForm = lazy(() => import('./Users'));

/**
 * ICT user directory: list, add (modal), profile edit (mirrors Vehicle Management).
 */
export default function IctUserManagement() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerFormLoading, setRegisterFormLoading] = useState(false);

  useEffect(() => {
    const root = document.querySelector('.content-dashboard');
    root?.classList.add('content-dashboard--user-mgmt');
    return () => root?.classList.remove('content-dashboard--user-mgmt');
  }, []);

  const openRegisterModal = () => {
    setRegisterFormLoading(true);
    setShowRegisterModal(true);
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
    setRegisterFormLoading(false);
  };

  const handleRegisterFormReady = () => setRegisterFormLoading(false);

  return (
    <>
      <div className="user-mgmt-shell">
        <header className="user-mgmt-header user-mgmt-header-row">
          <div className="user-mgmt-header-start" />
          <div className="user-mgmt-intro">
            <h3 className="user-mgmt-title">User Management</h3>
            <p className="user-mgmt-hint">
              Click a user row to open their profile. Use Add to register a new account.
            </p>
          </div>
          <div className="user-mgmt-header-end">
            <button
              type="button"
              className="user-mgmt-add-btn"
              onClick={openRegisterModal}
              disabled={showRegisterModal}
              aria-busy={registerFormLoading}
            >
              {registerFormLoading ? (
                <>
                  <Bars color="#fff" height={14} width={14} />
                  <span>Opening…</span>
                </>
              ) : (
                <>
                  <FaPlus aria-hidden />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </header>
        <div className="user-mgmt-body">
          <UsersDirectory embeddedInUserManagement managementView="list" />
        </div>
      </div>

      {showRegisterModal ? (
        <div
          className="user-register-modal-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeRegisterModal();
          }}
        >
          <div
            className="user-register-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-register-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="user-register-modal-header">
              <h3 id="user-register-modal-title">Register new user</h3>
              <button
                type="button"
                className="user-register-modal-close"
                onClick={closeRegisterModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="user-register-modal-body">
              {registerFormLoading ? (
                <div className="user-register-modal-loading" aria-live="polite">
                  <Bars color="#004B71" height={48} width={48} />
                  <p>Loading registration form…</p>
                </div>
              ) : null}
              <div
                className="user-register-modal-form-mount"
                aria-hidden={registerFormLoading}
                style={registerFormLoading ? { position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 } : undefined}
              >
                <Suspense fallback={null}>
                  <LazyUsersRegisterForm
                    embeddedInUserManagement
                    managementView="add"
                    registerInModal
                    onRegisterFormReady={handleRegisterFormReady}
                    onCancelAdd={closeRegisterModal}
                    onUserRegisteredSuccess={closeRegisterModal}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
