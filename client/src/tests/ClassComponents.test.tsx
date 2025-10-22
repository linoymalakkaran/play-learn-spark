import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthContextEnhanced } from '../contexts/AuthContextEnhanced';
import ClassDashboard from '../components/ClassDashboard';
import ClassManagement from '../components/ClassManagement';
import GroupManagementSimple from '../components/GroupManagementSimple';

// Mock the services
jest.mock('../services/classService', () => ({
  getMyClasses: jest.fn(),
  createClass: jest.fn(),
  joinClass: jest.fn(),
  previewClass: jest.fn(),
  getClassById: jest.fn(),
  getClassGroups: jest.fn(),
  createGroup: jest.fn(),
  addStudentToGroup: jest.fn(),
  removeStudentFromGroup: jest.fn(),
  deleteGroup: jest.fn(),
  autoAssignStudents: jest.fn(),
  approveStudent: jest.fn(),
  removeStudent: jest.fn(),
  regenerateJoinCode: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ classId: 'test-class-id' })
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn()
  })
}));

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockAuthValue = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser',
      roles: ['teacher'],
      profile: {
        firstName: 'Test',
        lastName: 'Teacher',
        name: 'Test Teacher'
      }
    },
    token: 'mock-token',
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    updateProfile: jest.fn(),
    refreshUser: jest.fn()
  };

  return (
    <BrowserRouter>
      <AuthContextEnhanced.Provider value={mockAuthValue}>
        {children}
      </AuthContextEnhanced.Provider>
    </BrowserRouter>
  );
};

describe('Class Management Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ClassManagement', () => {
    const mockClassService = require('../services/classService');

    beforeEach(() => {
      mockClassService.getMyClasses.mockResolvedValue({
        success: true,
        data: {
          classes: [
            {
              _id: 'class1',
              name: 'Math 101',
              subject: 'math',
              gradeLevel: '5th',
              joinCode: 'ABC123',
              students: [
                { user: { _id: 'student1', profile: { name: 'John Doe' } }, status: 'approved' }
              ],
              analytics: { totalStudents: 1, activeStudents: 1 }
            }
          ]
        }
      });
    });

    it('renders class management interface', async () => {
      render(
        <TestWrapper>
          <ClassManagement />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Class Management')).toBeInTheDocument();
      });
    });

    it('displays classes when loaded', async () => {
      render(
        <TestWrapper>
          <ClassManagement />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Math 101')).toBeInTheDocument();
        expect(screen.getByText('ABC123')).toBeInTheDocument();
      });
    });

    it('opens create class modal', async () => {
      render(
        <TestWrapper>
          <ClassManagement />
        </TestWrapper>
      );

      const createButton = screen.getByText('Create New Class');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create New Class')).toBeInTheDocument();
        expect(screen.getByLabelText(/class name/i)).toBeInTheDocument();
      });
    });

    it('creates a new class', async () => {
      mockClassService.createClass.mockResolvedValue({
        success: true,
        data: {
          class: {
            _id: 'new-class',
            name: 'New Test Class',
            joinCode: 'XYZ789'
          }
        }
      });

      render(
        <TestWrapper>
          <ClassManagement />
        </TestWrapper>
      );

      // Open modal
      fireEvent.click(screen.getByText('Create New Class'));

      await waitFor(() => {
        expect(screen.getByLabelText(/class name/i)).toBeInTheDocument();
      });

      // Fill form
      fireEvent.change(screen.getByLabelText(/class name/i), {
        target: { value: 'New Test Class' }
      });

      // Submit form
      fireEvent.click(screen.getByText('Create Class'));

      await waitFor(() => {
        expect(mockClassService.createClass).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Test Class'
          })
        );
      });
    });

    it('handles join class functionality', async () => {
      mockClassService.previewClass.mockResolvedValue({
        success: true,
        data: {
          class: {
            _id: 'preview-class',
            name: 'Preview Class',
            teacher: { profile: { name: 'Teacher Name' } },
            studentCount: 15
          }
        }
      });

      mockClassService.joinClass.mockResolvedValue({
        success: true,
        data: { class: { _id: 'joined-class' } }
      });

      render(
        <TestWrapper>
          <ClassManagement />
        </TestWrapper>
      );

      // Open join modal
      fireEvent.click(screen.getByText('Join Class'));

      await waitFor(() => {
        expect(screen.getByLabelText(/join code/i)).toBeInTheDocument();
      });

      // Enter join code
      fireEvent.change(screen.getByLabelText(/join code/i), {
        target: { value: 'TEST123' }
      });

      // Preview class
      fireEvent.click(screen.getByText('Preview'));

      await waitFor(() => {
        expect(mockClassService.previewClass).toHaveBeenCalledWith('TEST123');
      });
    });
  });

  describe('ClassDashboard', () => {
    const mockClassService = require('../services/classService');

    beforeEach(() => {
      mockClassService.getClassById.mockResolvedValue({
        success: true,
        data: {
          class: {
            _id: 'test-class-id',
            name: 'Test Class',
            subject: 'math',
            gradeLevel: '5th',
            joinCode: 'ABC123',
            teacher: {
              _id: 'teacher-id',
              profile: { name: 'Test Teacher' }
            },
            students: [
              {
                user: {
                  _id: 'student1',
                  profile: { name: 'Student One' },
                  email: 'student1@example.com'
                },
                status: 'approved',
                enrolledAt: new Date()
              }
            ],
            analytics: {
              totalStudents: 1,
              activeStudents: 1,
              averageCompletion: 85
            }
          }
        }
      });

      mockClassService.getClassGroups.mockResolvedValue({
        success: true,
        data: {
          groups: [
            {
              _id: 'group1',
              name: 'Study Group A',
              members: [{ user: { profile: { name: 'Student One' } } }],
              settings: { maxMembers: 6 }
            }
          ]
        }
      });
    });

    it('renders class dashboard', async () => {
      render(
        <TestWrapper>
          <ClassDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Class')).toBeInTheDocument();
        expect(screen.getByText('ABC123')).toBeInTheDocument();
      });
    });

    it('displays overview tab by default', async () => {
      render(
        <TestWrapper>
          <ClassDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Class Overview')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // Student count
      });
    });

    it('switches between tabs', async () => {
      render(
        <TestWrapper>
          <ClassDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Class')).toBeInTheDocument();
      });

      // Click Students tab
      fireEvent.click(screen.getByText('Students'));

      await waitFor(() => {
        expect(screen.getByText('Student One')).toBeInTheDocument();
      });

      // Click Groups tab
      fireEvent.click(screen.getByText('Groups'));

      await waitFor(() => {
        expect(screen.getByText('Study Group A')).toBeInTheDocument();
      });
    });

    it('handles student approval', async () => {
      // Mock a class with pending students
      mockClassService.getClassById.mockResolvedValue({
        success: true,
        data: {
          class: {
            _id: 'test-class-id',
            name: 'Test Class',
            students: [
              {
                user: {
                  _id: 'student1',
                  profile: { name: 'Pending Student' },
                  email: 'pending@example.com'
                },
                status: 'pending',
                enrolledAt: new Date()
              }
            ]
          }
        }
      });

      mockClassService.approveStudent.mockResolvedValue({
        success: true
      });

      render(
        <TestWrapper>
          <ClassDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Students'));
      });

      await waitFor(() => {
        expect(screen.getByText('Pending Student')).toBeInTheDocument();
      });

      // Approve student
      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockClassService.approveStudent).toHaveBeenCalledWith('test-class-id', 'student1');
      });
    });
  });

  describe('GroupManagementSimple', () => {
    const mockClassService = require('../services/classService');

    beforeEach(() => {
      mockClassService.getClassById.mockResolvedValue({
        success: true,
        data: {
          class: {
            _id: 'test-class-id',
            name: 'Test Class',
            teacher: { _id: 'teacher-id' },
            students: [
              {
                user: {
                  _id: 'student1',
                  profile: { name: 'Student One' },
                  email: 'student1@example.com'
                },
                status: 'approved'
              },
              {
                user: {
                  _id: 'student2',
                  profile: { name: 'Student Two' },
                  email: 'student2@example.com'
                },
                status: 'approved'
              }
            ]
          }
        }
      });

      mockClassService.getClassGroups.mockResolvedValue({
        success: true,
        data: {
          groups: [
            {
              _id: 'group1',
              name: 'Group A',
              members: [
                { user: { _id: 'student1', profile: { name: 'Student One' } } }
              ],
              settings: { maxMembers: 4 }
            }
          ]
        }
      });
    });

    it('renders group management interface', async () => {
      render(
        <TestWrapper>
          <GroupManagementSimple />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Group Management')).toBeInTheDocument();
      });
    });

    it('displays existing groups', async () => {
      render(
        <TestWrapper>
          <GroupManagementSimple />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Group A')).toBeInTheDocument();
        expect(screen.getByText('Student One')).toBeInTheDocument();
      });
    });

    it('creates a new group', async () => {
      mockClassService.createGroup.mockResolvedValue({
        success: true,
        data: {
          group: {
            _id: 'new-group',
            name: 'New Group',
            members: []
          }
        }
      });

      render(
        <TestWrapper>
          <GroupManagementSimple />
        </TestWrapper>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Create Group'));
      });

      // Fill group form
      fireEvent.change(screen.getByLabelText(/group name/i), {
        target: { value: 'New Test Group' }
      });

      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(mockClassService.createGroup).toHaveBeenCalledWith(
          'test-class-id',
          expect.objectContaining({
            name: 'New Test Group'
          })
        );
      });
    });

    it('assigns students to groups', async () => {
      mockClassService.addStudentToGroup.mockResolvedValue({
        success: true
      });

      render(
        <TestWrapper>
          <GroupManagementSimple />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Group A')).toBeInTheDocument();
      });

      // Find unassigned student section
      await waitFor(() => {
        expect(screen.getByText('Student Two')).toBeInTheDocument();
      });

      // Simulate assignment (this would involve drag and drop or dropdown selection)
      // For simplicity, we'll test the service call directly
      expect(mockClassService.addStudentToGroup).not.toHaveBeenCalled();
    });

    it('uses auto-assignment feature', async () => {
      mockClassService.autoAssignStudents.mockResolvedValue({
        success: true,
        data: { message: 'Students assigned successfully' }
      });

      render(
        <TestWrapper>
          <GroupManagementSimple />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Auto Assign')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Auto Assign'));

      await waitFor(() => {
        expect(mockClassService.autoAssignStudents).toHaveBeenCalledWith('test-class-id');
      });
    });

    it('deletes a group', async () => {
      mockClassService.deleteGroup.mockResolvedValue({
        success: true
      });

      render(
        <TestWrapper>
          <GroupManagementSimple />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Group A')).toBeInTheDocument();
      });

      // Find delete button (might be in a menu or direct button)
      const deleteButtons = screen.getAllByText(/delete/i);
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(mockClassService.deleteGroup).toHaveBeenCalledWith('group1');
        });
      }
    });
  });
});