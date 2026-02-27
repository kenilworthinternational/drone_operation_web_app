import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetRegistrationOptionsQuery } from '../api/services NodeJs/publicRegistrationApi';
import { API_BASE_URL } from '../config/config';
import LiquidEther from '../UI/LiquidEther';
import { useWipeNavigate } from '../utils/useWipeNavigate';
import '../styles/register.css';
import '../styles/pageWipe.css';

const STEPS_EXTERNAL = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Role & Access' },
  { id: 3, label: 'Organization' },
];

const STEPS_INTERNAL = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Role & Access' },
];

// Extracted outside so it never re-renders on form state changes
const LeftPanel = () => (
  <div className="register-left-panel">
    <img src="/assets/images/kenilworth.png" alt="Kenilworth" className="register-left-logo" />
    <h1 className="register-left-title">Drone Services<br />Management System</h1>
    <p className="register-left-subtitle">Create your account</p>
    <ul className="register-left-features">
      <li>
        <span className="register-feature-icon">&#9873;</span>
        <span>Real-time drone operations monitoring</span>
      </li>
      <li>
        <span className="register-feature-icon">&#9881;</span>
        <span>Fleet &amp; equipment management</span>
      </li>
      <li>
        <span className="register-feature-icon">&#128202;</span>
        <span>Plantation analytics &amp; reporting</span>
      </li>
      <li>
        <span className="register-feature-icon">&#128274;</span>
        <span>Secure role-based access control</span>
      </li>
    </ul>
    <span className="register-left-footer">Powered by Kenilworth International</span>
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const { wipeNavigate, wipeOverlay } = useWipeNavigate();
  const { data: options, isLoading: optionsLoading } = useGetRegistrationOptionsQuery();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    nic: '',
    password: '',
    mobile_no: '',
    user_level: '',
    member_type: '',
    job_role: '',
    group: '',
    plantation: '',
    region: '',
    estate: '',
  });

  const isExternal = form.member_type === 'e';
  const STEPS = isExternal ? STEPS_EXTERNAL : STEPS_INTERNAL;
  const totalSteps = STEPS.length;

  const handleChange = useCallback((field, value) => {
    setError('');
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'group') { next.plantation = ''; next.region = ''; next.estate = ''; }
      else if (field === 'plantation') { next.region = ''; next.estate = ''; }
      else if (field === 'region') { next.estate = ''; }
      else if (field === 'member_type' || field === 'user_level') {
        next.job_role = '';
        // If switching from external to internal, clear org fields
        if (field === 'member_type' && value !== 'e') {
          next.group = '';
          next.plantation = '';
          next.region = '';
          next.estate = '';
        }
      }
      return next;
    });
    // If member_type changed to internal and we're on step 3 (org), go back to step 2
    if (field === 'member_type' && value !== 'e') {
      setStep(prev => Math.min(prev, 2));
    }
  }, []);

  const filteredPlantations = useMemo(() => {
    if (!options?.plantations || !form.group) return [];
    return options.plantations.filter(p => String(p.groupId) === String(form.group));
  }, [options?.plantations, form.group]);

  const filteredRegions = useMemo(() => {
    if (!options?.regions || !form.plantation) return [];
    return options.regions.filter(r => String(r.plantationId) === String(form.plantation));
  }, [options?.regions, form.plantation]);

  const filteredEstates = useMemo(() => {
    if (!options?.estates || !form.region) return [];
    return options.estates.filter(e => String(e.regionId) === String(form.region));
  }, [options?.estates, form.region]);

  const filteredJobRoles = useMemo(() => {
    if (!options?.jobRoles) return [];
    return options.jobRoles.filter(jr => {
      if (form.member_type && jr.memberTypeCode !== form.member_type) return false;
      if (form.user_level && jr.userLevelCode !== form.user_level) return false;
      return true;
    });
  }, [options?.jobRoles, form.member_type, form.user_level]);

  const validateStep = (s) => {
    if (s === 1) {
      if (!form.name.trim()) return 'Name is required';
      if (!form.nic.trim()) return 'NIC is required';
      if (!form.mobile_no.trim() || form.mobile_no.length !== 9) return 'Valid 9-digit mobile number is required';
      if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters';
    }
    if (s === 2) {
      if (!form.user_level) return 'User level is required';
      if (!form.member_type) return 'Member type is required';
      if (!form.job_role) return 'Job role is required';
    }
    if (s === 3 && isExternal) {
      if (!form.estate) return 'Please select an estate';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => { setError(''); setStep(prev => Math.max(prev - 1, 1)); };

  const handleSubmit = async () => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      if (form.email.trim()) formData.append('email', form.email.trim());
      formData.append('nic', form.nic.trim());
      formData.append('password', form.nic.trim());
      formData.append('user_level', form.user_level);
      formData.append('member_type', form.member_type);
      formData.append('job_role', form.job_role);
      formData.append('mobile_no', `0${form.mobile_no}`);
      if (isExternal) {
        formData.append('group', form.group);
        formData.append('plantation', form.plantation);
        formData.append('region', form.region);
        formData.append('estate', form.estate);
      }
      formData.append('activated', '0');
      if (profileImage) {
        formData.append('image', profileImage);
      }

      const response = await fetch(`${API_BASE_URL}create_user`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok && (data.status === true || data.status === 'true')) {
        setSuccess(true);
      } else {
        setError(data.message || data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhoneChange = (val) => {
    if (!/^\d*$/.test(val)) return;
    if (val.length === 1 && val[0] === '0') return;
    if (val.length <= 9) handleChange('mobile_no', val);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  // ---- Success View ----
  if (success) {
    return (
      <div className="register-page">
        {wipeOverlay}
        <div className="register-content">
          <LeftPanel />
          <div className="register-right-panel">
            <div className="register-right-bg"><LiquidEther /></div>
            <div className="register-right-content register-right-content--center">
              <div className="register-success">
                <div className="register-success-card">
                  <div className="register-success-icon">&#10003;</div>
                  <h2>Registration Submitted</h2>
                  <p>
                    Your account has been created and is pending administrator approval.
                    You will be able to log in once your account has been activated.
                  </p>
                  <button className="register-btn primary" onClick={() => wipeNavigate('/login', 'rtl')}>
                    Back to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      {wipeOverlay}
      <div className="register-content">
        {/* Left Branding Panel */}
        <LeftPanel />

        {/* Right Form Panel */}
        <div className="register-right-panel">
          {/* Animation background - only in right panel */}
          <div className="register-right-bg"><LiquidEther /></div>
          {/* Form content on top */}
          <div className="register-right-content">
        <div className="register-form-area">
          {/* Step Indicator */}
          <div className="register-steps">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div
                  className={`register-step ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}
                  onClick={() => { if (s.id < step) setStep(s.id); }}
                >
                  <span className="register-step-number">
                    {step > s.id ? '\u2713' : s.id}
                  </span>
                  <span className="register-step-text">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`register-step-line ${step > s.id ? 'active' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form Card */}
          <div className="register-card">
            <div className="register-body">
              {error && <div className="register-error">{error}</div>}

              {optionsLoading ? (
                <div className="register-loading"><div className="register-spinner" /></div>
              ) : (
                <>
                  {/* Step 1: Personal Info */}
                  {step === 1 && (
                    <div className="register-section" key="step1">
                      <div className="register-section-title">Personal Information</div>

                      {/* Profile Image Upload */}
                      <div className="register-image-upload">
                        <div
                          className="register-image-preview"
                          onClick={() => document.getElementById('reg-profile-img').click()}
                        >
                          {imagePreview ? (
                            <img src={imagePreview} alt="Profile" />
                          ) : (
                            <div className="register-image-placeholder">
                              <span className="register-image-icon">&#128247;</span>
                              <span>Upload Photo</span>
                            </div>
                          )}
                        </div>
                        <input
                          id="reg-profile-img"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                        {imagePreview && (
                          <button type="button" className="register-image-remove" onClick={removeImage}>
                            &#10005; Remove
                          </button>
                        )}
                      </div>

                      <div className="register-row">
                        <div className="register-field">
                          <label>Full Name <span className="required">*</span></label>
                          <input
                            className="register-input"
                            type="text"
                            placeholder="Enter your full name"
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                          />
                        </div>
                        <div className="register-field">
                          <label>Email</label>
                          <input
                            className="register-input"
                            type="email"
                            placeholder="email@example.com"
                            value={form.email}
                            onChange={e => handleChange('email', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="register-row">
                        <div className="register-field">
                          <label>NIC Number <span className="required">*</span></label>
                          <input
                            className="register-input"
                            type="text"
                            placeholder="e.g. 200012345678"
                            value={form.nic}
                            onChange={e => handleChange('nic', e.target.value)}
                          />
                        </div>
                        <div className="register-field">
                          <label>Mobile Number <span className="required">*</span></label>
                          <div className="register-phone-row">
                            <span className="register-phone-prefix">+94</span>
                            <input
                              className="register-input"
                              type="tel"
                              placeholder="7XXXXXXXX"
                              value={form.mobile_no}
                              onChange={e => handlePhoneChange(e.target.value)}
                              maxLength={9}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="register-row">
                        <div className="register-field">
                          <label>Password <span className="required">*</span></label>
                          <div className="register-password-wrap">
                            <input
                              className="register-input"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Minimum 6 characters"
                              value={form.password}
                              onChange={e => handleChange('password', e.target.value)}
                            />
                            <button
                              type="button"
                              className="register-password-toggle"
                              onClick={() => setShowPassword(p => !p)}
                              tabIndex={-1}
                            >
                              {showPassword ? '\u25CF' : '\u25CB'}
                            </button>
                          </div>
                        </div>
                        <div className="register-field" />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Role & Access */}
                  {step === 2 && (
                    <div className="register-section" key="step2">
                      <div className="register-section-title">Role &amp; Access Level</div>
                      <div className="register-row">
                        <div className="register-field">
                          <label>Member Type <span className="required">*</span></label>
                          <select
                            className="register-select"
                            value={form.member_type}
                            onChange={e => handleChange('member_type', e.target.value)}
                          >
                            <option value="">Select member type</option>
                            {(options?.memberTypes || []).map(mt => (
                              <option key={mt.code} value={mt.code}>{mt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="register-field">
                          <label>User Level <span className="required">*</span></label>
                          <select
                            className="register-select"
                            value={form.user_level}
                            onChange={e => handleChange('user_level', e.target.value)}
                          >
                            <option value="">Select user level</option>
                            {(options?.userLevels || []).map(ul => (
                              <option key={ul.code} value={ul.code}>{ul.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="register-row">
                        <div className="register-field">
                          <label>Job Role <span className="required">*</span></label>
                          <select
                            className="register-select"
                            value={form.job_role}
                            onChange={e => handleChange('job_role', e.target.value)}
                            disabled={!form.member_type && !form.user_level}
                          >
                            <option value="">
                              {!form.member_type && !form.user_level
                                ? 'Select member type & level first'
                                : 'Select job role'}
                            </option>
                            {filteredJobRoles.map(jr => (
                              <option key={jr.code} value={jr.code}>{jr.label} ({jr.code})</option>
                            ))}
                          </select>
                        </div>
                        <div className="register-field" />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Organization (External users only) */}
                  {step === 3 && isExternal && (
                    <div className="register-section" key="step3">
                      <div className="register-section-title">Organization</div>
                      <div className="register-row">
                        <div className="register-field">
                          <label>Group <span className="required">*</span></label>
                          <select
                            className="register-select"
                            value={form.group}
                            onChange={e => handleChange('group', e.target.value)}
                          >
                            <option value="">Select group</option>
                            {(options?.groups || []).map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="register-field">
                          <label>Plantation <span className="required">*</span></label>
                          <select
                            className="register-select"
                            value={form.plantation}
                            onChange={e => handleChange('plantation', e.target.value)}
                            disabled={!form.group}
                          >
                            <option value="">{form.group ? 'Select plantation' : 'Select group first'}</option>
                            {filteredPlantations.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="register-row">
                        <div className="register-field">
                          <label>Region <span className="required">*</span></label>
                          <select
                            className="register-select"
                            value={form.region}
                            onChange={e => handleChange('region', e.target.value)}
                            disabled={!form.plantation}
                          >
                            <option value="">{form.plantation ? 'Select region' : 'Select plantation first'}</option>
                            {filteredRegions.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="register-field">
                          <label>Estate <span className="required">*</span></label>
                          <select
                            className="register-select"
                            value={form.estate}
                            onChange={e => handleChange('estate', e.target.value)}
                            disabled={!form.region}
                          >
                            <option value="">{form.region ? 'Select estate' : 'Select region first'}</option>
                            {filteredEstates.map(e => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="register-actions">
                    {step > 1 && (
                      <button className="register-btn secondary" onClick={handleBack} disabled={submitting}>
                        Back
                      </button>
                    )}
                    {step < totalSteps ? (
                      <button className="register-btn primary" onClick={handleNext}>
                        Continue
                      </button>
                    ) : (
                      <button
                        className="register-btn primary"
                        onClick={handleSubmit}
                        disabled={submitting}
                      >
                        {submitting ? 'Registering...' : 'Submit Registration'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="register-form-footer">
            <p>Already have an account? <a href="#/login" onClick={e => { e.preventDefault(); wipeNavigate('/login', 'rtl'); }}>Sign in</a></p>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
