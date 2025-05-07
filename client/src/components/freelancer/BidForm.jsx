import { useState } from 'react';
import { bidService } from '../../utils/bidService';
import toast from 'react-hot-toast';
import { FaDollarSign, FaRegClock, FaFileAlt } from 'react-icons/fa';

const BidForm = ({ projectId, onBidSubmit }) => {
    const [formData, setFormData] = useState({
        amount: '',
        deliveryTime: '',
        proposal: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        }
        
        if (!formData.deliveryTime || isNaN(formData.deliveryTime) || formData.deliveryTime <= 0) {
            newErrors.deliveryTime = 'Please enter a valid delivery time in days';
        }
        
        if (!formData.proposal || formData.proposal.length < 50) {
            newErrors.proposal = 'Proposal must be at least 50 characters';
        } else if (formData.proposal.length > 1000) {
            newErrors.proposal = 'Proposal cannot exceed 1000 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            setLoading(true);
            await bidService.createBid(projectId, {
                amount: Number(formData.amount),
                deliveryTime: Number(formData.deliveryTime),
                proposal: formData.proposal
            });
            
            toast.success('Bid submitted successfully!');
            setFormData({ amount: '', deliveryTime: '', proposal: '' });
            
            if (onBidSubmit) onBidSubmit();
        } catch (error) {
            toast.error(error.message || 'Failed to submit bid');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                        <div className="flex items-center">
                            <FaDollarSign className="mr-2 text-green-500" />
                            Bid Amount ($)
                        </div>
                    </label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter your bid amount"
                    />
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                </div>
                
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                        <div className="flex items-center">
                            <FaRegClock className="mr-2 text-blue-500" />
                            Delivery Time (days)
                        </div>
                    </label>
                    <input
                        type="number"
                        name="deliveryTime"
                        value={formData.deliveryTime}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${errors.deliveryTime ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Delivery time in days"
                    />
                    {errors.deliveryTime && <p className="text-red-500 text-xs mt-1">{errors.deliveryTime}</p>}
                </div>
            </div>
            
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                    <div className="flex items-center">
                        <FaFileAlt className="mr-2 text-indigo-500" />
                        Proposal
                    </div>
                </label>
                <textarea
                    name="proposal"
                    value={formData.proposal}
                    onChange={handleChange}
                    rows="4"
                    className={`w-full px-3 py-2 border rounded-md ${errors.proposal ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Describe why you're the best fit for this project (min 50 characters)"
                ></textarea>
                <div className="flex justify-between items-center mt-1">
                    {errors.proposal && <p className="text-red-500 text-xs">{errors.proposal}</p>}
                    <p className={`text-xs ${formData.proposal.length < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                        {formData.proposal.length}/1000
                    </p>
                </div>
            </div>
            
            <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Submitting...' : 'Submit Bid'}
            </button>
        </form>
    );
};

export default BidForm;