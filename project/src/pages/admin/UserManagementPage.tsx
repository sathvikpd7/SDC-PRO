import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Eye } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { User } from '../../types';
import { userApi } from '../../services/userApi';

const UserManagementPage: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await userApi.getUsers();
      setStudents(users);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle student actions
  const handleViewStudent = (student: User) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };
  
  const handleEditStudent = async (student: User) => {
    try {
      await userApi.updateUser(student.id, student);
      toast.success('Student updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update student');
    }
  };
  
  const handleDeleteStudent = async (student: User) => {
    try {
      await userApi.deleteUser(student.id);
      toast.success('Student deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };
  
  // Handle save changes in edit modal
  const handleSaveChanges = () => {
    // In a real app, you would make an API call to update the student
    setIsEditModalOpen(false);
    toast.success('Student details updated successfully!');
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!selectedStudent) return;
    
    // In a real app, you would make an API call to delete the student
    setStudents(students.filter(student => student.id !== selectedStudent.id));
    setIsDeleteModalOpen(false);
    toast.success('Student removed successfully!');
  };
  
  // Add new student (would be implemented in a real app)
  const handleAddStudent = () => {
    toast.success('This would open a form to add a new student');
  };
  
  return (
    <AdminLayout
      title="User Management"
      subtitle="Manage student accounts and information"
      actionButton={
        <Button
          onClick={handleAddStudent}
          className="flex items-center"
        >
          <UserPlus size={18} className="mr-2" />
          Add Student
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Student Directory</CardTitle>
            <div className="w-full md:w-auto">
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={18} />}
                className="min-w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {student.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.email}
                    </td>
                    <td className="px-4 py-3">
                      {student.roomNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewStudent(student)}
                          className="text-gray-600 hover:text-blue-700"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                          className="text-gray-600 hover:text-amber-600"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStudent(student)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No students found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* View Student Modal */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Student Details</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="font-medium">{selectedStudent.name}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="font-medium">{selectedStudent.email}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Room Number</span>
                  <span className="font-medium">{selectedStudent.roomNumber}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full w-fit mt-1 ${
                    selectedStudent.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedStudent.status}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Account Created</span>
                  <span className="font-medium">May 10, 2023</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Total Meals Booked</span>
                  <span className="font-medium">32</span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Student Modal */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Student</h2>
              
              <div className="space-y-4">
                <Input
                  label="Name"
                  type="text"
                  defaultValue={selectedStudent.name}
                  fullWidth
                />
                
                <Input
                  label="Email"
                  type="email"
                  defaultValue={selectedStudent.email}
                  fullWidth
                />
                
                <Input
                  label="Room Number"
                  type="text"
                  defaultValue={selectedStudent.roomNumber}
                  fullWidth
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={selectedStudent.status}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Confirm Deletion</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to remove {selectedStudent.name} from the system? 
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger"
                  onClick={handleConfirmDelete}
                >
                  Delete Student
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserManagementPage;