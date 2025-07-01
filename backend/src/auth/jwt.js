const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

class JWTService {
  /**
   * Generate access token
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'digame-platform',
      audience: 'digame-users'
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'digame-platform',
      audience: 'digame-users'
    });
  }

  /**
   * Generate token pair (access + refresh)
   */
  generateTokenPair(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier || 'free',
      teamId: user.teamId || null,
      permissions: user.permissions || [],
      isPlatformOwner: user.isPlatformOwner || false
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken({ userId: user.id }),
      expiresIn: JWT_EXPIRES_IN,
      tokenType: 'Bearer'
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error(`Invalid access token: ${error.message}`);
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token) {
    return jwt.decode(token, { complete: true });
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    
    return parts[1];
  }
}

module.exports = new JWTService();