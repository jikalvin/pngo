import authReducer, { setAuthenticated, setUser, logoutUser } from '../authSlice'; // Adjust path

describe('authSlice reducers', () => {
  const initialState = {
    isAuthenticated: false,
    user: null,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setAuthenticated', () => {
    expect(authReducer(initialState, setAuthenticated(true))).toEqual({
      isAuthenticated: true,
      user: null,
    });
    expect(authReducer({ isAuthenticated: true, user: null }, setAuthenticated(false))).toEqual({
      isAuthenticated: false,
      user: null,
    });
  });

  it('should handle setUser', () => {
    const mockUser = { id: '1', username: 'test', userType: 'user' };
    expect(authReducer(initialState, setUser(mockUser))).toEqual({
      isAuthenticated: false, // setUser does not change isAuthenticated by itself in this slice
      user: mockUser,
    });

    const anotherUser = { id: '2', username: 'admin', userType: 'admin' };
    expect(authReducer({ isAuthenticated: true, user: mockUser }, setUser(anotherUser))).toEqual({
      isAuthenticated: true,
      user: anotherUser,
    });
    
    expect(authReducer({ isAuthenticated: true, user: mockUser }, setUser(null))).toEqual({
        isAuthenticated: true,
        user: null,
      });
  });

  it('should handle logoutUser', () => {
    const loggedInState = {
      isAuthenticated: true,
      user: { id: '1', username: 'test', userType: 'user' },
    };
    expect(authReducer(loggedInState, logoutUser())).toEqual(initialState);

    // Test logout from an already logged out state
    expect(authReducer(initialState, logoutUser())).toEqual(initialState);
  });
});
