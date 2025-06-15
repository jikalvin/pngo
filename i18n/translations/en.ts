export default {
  common: {
    welcome: 'Welcome',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    continue: 'Continue',
    back: 'Back',
    phoneNumber: 'Phone Number', // Retaining for now, though phone auth is removed
    done: 'Done',
    error: "Error",
    needHelp: "Need help? Contact Support",
    languageEnglish: "ENGLISH", // Example for language switcher
    success: "Success", // Added
    notAvailable: "N/A", // General N/A, if profile.notAvailable is too specific
  },
  onboarding: {
    selectUserType: 'Select User Type', // Existing
    customer: 'Customer', // Existing
    driver: 'Driver', // Existing
    customerDescription: 'I want to send packages', // Existing, but listed as userDescription in plan
    driverDescription: 'I want to deliver packages', // Existing, but listed as pickerDescription in plan
    userTypePrompt: "How would you like to use the app?",
    continueAsUser: "Continue as User",
    userDescription: "I want to send or receive packages", // New key, similar to existing customerDescription
    continueAsPicker: "Continue as Picker",
    pickerDescription: "I want to deliver packages and earn", // New key, similar to existing driverDescription
  },
  auth: {
    signInTitle: 'Sign in to your account', // Existing
    signUpTitle: 'Create your account', // Updated from "Create an account"
    forgotPassword: 'Forgot Password?', // Existing
    noAccount: "Need an account?", // Updated from "Don't have an account?"
    hasAccount: 'Already have an account?', // Existing
    enterPhoneNumber: 'Enter your phone number', // Retaining, matches fr.ts
    useEmail: 'Use Email instead', // Retaining, matches fr.ts
    verifyPhoneNumber: 'Verify Phone Number', // Retaining, matches fr.ts
    enterVerificationCode: 'Enter the verification code sent to', // Retaining, matches fr.ts
    // New keys for email/password form
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    signInButton: "Sign In", // Specific button text, distinct from common.signIn if needed for context
    signUpButton: "Sign Up", // Specific button text, distinct from common.signUp if needed for context
    // toggleToSignIn: "Already have an account? Sign In", // Covered by auth.hasAccount + auth.signInButton
    // toggleToSignUp: "Need an account? Sign Up", // Covered by auth.noAccount + auth.signUpButton
    alertSignUpSuccessTitle: "Sign Up Successful",
    alertSignUpSuccessMessage: "Your account has been created.",
    alertSignInSuccessTitle: "Sign In Successful",
    alertSignInSuccessMessage: "Welcome back!",
    alertAuthErrorTitle: "Authentication Error",
    alertValidationEmailPassword: "Please enter both email and password.",
    alertUserRoleMissing: "User role not specified. Cannot complete registration.",
  },
  profile: {
    title: "Profile",
    notAvailable: "N/A", // Added
    personalDetailsTitle: "Personal Details",
    personalDetailsDescription: "Name, phone number, address, email",
    accountSettingsTitle: "Account Settings",
    accountSettingsDescription: "Password, payment and security",
    kycVerificationTitle: "KYC & Verification",
    kycVerificationDescriptionPrefix: "Verification Status:",
    kycVerificationStatusVerified: "Verified",
    appPreferencesTitle: "App Preferences",
    appPreferencesDescription: "Language and Theme",
    availabilityTitle: "Availability",
    availabilityDescription: "Schedule, Unavailable",
    deliveryHistoryTitle: "Delivery History",
    deliveryHistoryDescription: "View completed, ongoing, and cancelled tasks",
    favouritesTitle: "Favourites",
    favouritesDescription: "Favorite Pickers for quick access"
  },
  myPackages: {
    title: "My Packages",
    emptyStateText: "No packages yet",
    emptyStateSubtext: "Your packages will appear here"
  },
  search: {
    title: "Available Tasks",
    emptyStateText: "No open tasks available at the moment."
  },
  packageCard: {
    fromPrefix: "From: ",
    toPrefix: "To: ",
    createdPrefix: "Created: "
  },
  statusBadge: {
    pending: "Pending",
    in_transit: "In Transit",
    delivered: "Delivered",
    cancelled: "Cancelled",
    open: "Open",
    assigned: "Assigned"
    // Add other statuses as they appear
  },
  createTask: {
    headerTitle: "Create Delivery",
    step1Header: "Package Info",
    step2Header: "Delivery Details",
    step3Header: "Summary",
    uploadVideoHint: "Upload a video (1min max)",
    uploadImagesHint: "Upload up to 4 images",
    deliveryNameLabel: "Delivery name",
    deliveryNamePlaceholder: "Enter delivery name",
    sizeEstimateLabel: "Size estimate",
    sizeEstimatePlaceholder: "Size & Moto",
    weightLabel: "Weight",
    weightPlaceholder: "Enter weight in kg",
    typePriorityLabel: "Type & Priority",
    typeDefault: "Standard",
    priorityDefault: "Standard",
    cancelButton: "Cancel",
    dateLabel: "Date",
    datePlaceholder: "Select date",
    timeLabel: "Time",
    timePlaceholder: "Select delivery time",
    pickingAddressLabel: "Picking Address",
    pickingAddressPlaceholder: "Enter Picking Address",
    droppingAddressLabel: "Dropping Address",
    droppingAddressPlaceholder: "Enter Dropping Address",
    priceRangeLabel: "Price Range",
    minAmountPlaceholder: "Min amount",
    maxAmountPlaceholder: "Max amount",
    paymentMethodsLabel: "Accepted Payment Methods",
    paymentMethodsPlaceholder: "Select payment methods",
    summaryDeliveryTitleLabel: "Delivery Title", // Used for dynamic display if needed
    summarySizeLabel: "Size",
    summaryWeightLabel: "Weight",
    summaryKgSuffix: "kg",
    summaryPriorityLabel: "Priority",
    summaryTypeLabel: "Type",
    summaryPriceLabel: "Price",
    summaryAddressJoiner: "to",
    summaryPickupDateLabel: "Pickup Date",
    summaryAtConnector: "at",
    summaryPaymentMethodsLabel: "Payment Methods",
    summaryNoImage: "No Image",
    createButton: "Create",
    alertMissingLogin: "You must be logged in to create a task.",
    alertCreateSuccessTitle: "Success", // Can use common.success
    alertCreateSuccessMessage: "Task created successfully!",
    alertCreateErrorTitle: "Error Creating Task", // Can use common.error
    alertCreateErrorMessage: "Failed to create task. Please try again."
  },
  packageDetails: {
    headerFallbackPrefix: "Task #",
    errorTitle: "Error", // Can use common.error
    taskNotFound: "Task Not Found",
    taskLoadError: "Could not load task details.",
    sectionPackageDetails: "Package Details",
    labelFrom: "From",
    labelTo: "To",
    labelDescription: "Description",
    labelWeight: "Weight",
    labelKgSuffix: "kg",
    labelSize: "Size",
    labelPriority: "Priority",
    labelType: "Type",
    labelPriceRange: "Price Range",
    labelPaymentMethods: "Payment Methods",
    labelCreatedAt: "Created At",
    labelNotAvailable: "N/A", // Can use common.notAvailable or profile.notAvailable
    sectionPlaceBid: "Place Your Bid",
    bidAmountPlaceholder: "Enter your bid amount",
    submitBidButton: "Submit Bid",
    bidPlacedButton: "Bid Placed",
    alertInvalidBidTitle: "Invalid Bid",
    alertInvalidBidMessage: "Please enter a valid bid amount.",
    alertUserOrTaskMissing: "User or task details missing.",
    alertBidSuccessTitle: "Success", // Can use common.success
    alertBidSuccessMessage: "Bid placed successfully!",
    alertBidErrorTitle: "Error Placing Bid", // Can use common.error
    alertBidErrorMessage: "Failed to place bid. Please try again.",
    sectionBidsReceived: "Bids Received",
    labelBidderNamePrefix: "Picker ID: ",
    labelBidAmountPrefix: "Amount: $",
    labelBidTimestampPrefix: "Placed: ",
    acceptBidButton: "Accept Bid",
    noActiveBids: "No active bids yet for this task.",
    alertAcceptAuthError: "You are not authorized to accept bids for this task.",
    alertAcceptSuccessTitle: "Success", // Can use common.success
    alertAcceptSuccessMessage: "Bid accepted and task assigned!",
    alertAcceptErrorTitle: "Error Accepting Bid", // Can use common.error
    alertAcceptErrorMessage: "Failed to accept bid. Please try again.",
    viewAssignedPickerButton: "View Assigned Picker / All Bids",
    chatButton: "Chat",
    trackButton: "Track"
  }
};