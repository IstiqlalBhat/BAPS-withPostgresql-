import { NextRequest, NextResponse } from 'next/server';
import { decode } from 'jsonwebtoken';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let userId: string;

    try {
      const decoded = decode(token, { complete: false }) as DecodedToken | null;
      if (!decoded || !decoded.id) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // If token is valid and not expired, Revit is authenticated
    const now = Math.floor(Date.now() / 1000);
    const decoded = decode(token, { complete: false }) as DecodedToken | null;

    if (!decoded || decoded.exp < now) {
      return NextResponse.json(
        { connected: false, elementCount: 0 },
        { status: 200 }
      );
    }

    // Token is valid, so Revit is authenticated
    // Now check for synced elements and last sync time
    const response = await fetch('http://localhost:3001/api/elements', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    let elementCount = 0;
    let lastSynced: string | undefined;

    if (response.ok) {
      const data = await response.json();
      const elements = Array.isArray(data) ? data : data.elements || [];
      elementCount = elements.length;

      // Get the most recent element's sync time
      if (elements.length > 0) {
        // Sort by updatedAt or createdAt
        const sorted = elements.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        const lastElement = sorted[0];
        const lastDate = new Date(lastElement.updatedAt || lastElement.createdAt);

        // Format time difference (e.g., "5 minutes ago")
        const diffMs = Date.now() - lastDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) {
          lastSynced = 'Just now';
        } else if (diffMins < 60) {
          lastSynced = `${diffMins}m ago`;
        } else if (diffHours < 24) {
          lastSynced = `${diffHours}h ago`;
        } else {
          lastSynced = `${diffDays}d ago`;
        }
      }
    }

    return NextResponse.json(
      {
        connected: true, // Connected if token is valid
        elementCount,
        lastSynced,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking Revit status:', error);
    return NextResponse.json(
      { error: 'Internal server error', connected: false },
      { status: 500 }
    );
  }
}
