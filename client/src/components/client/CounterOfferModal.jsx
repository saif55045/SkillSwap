import { useState } from 'react';
import { FaDollarSign, FaRegCommentAlt } from 'react-icons/fa';

const CounterOfferModal = ({ bid, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        amount: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Initialize form with suggested amount from current bid
    useState(() => {
        // Suggest a counter offer amount (e.g., 10% less than current bid)
        const suggestedAmount = Math.floor(bid.amount * 0.9);
        setFormData(prev => ({
            ...prev,
            amount: suggestedAmount
        }));
    }, [bid]);

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
        
        if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        }
        
        if (!formData.message || formData.message.length < 10) {
            newErrors.message = 'Please provide a message (min 10 characters)';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            setLoading(true);
            await onSubmit({
                amount: Number(formData.amount),
                message: formData.message
            });
        } catch (error) {
            console.error('Error submitting counter offer:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-xl font-semibold mb-4">Make Counter Offer</h2>
                
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Original bid: ${bid.amount}</span>
                        <span>Freelancer: {bid.freelancerId.name}</span>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            <div className="flex items-center">
                                <FaDollarSign className="mr-2 text-green-500" />
                                Counter Offer Amount ($)
                            </div>
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter your counter offer amount"
                        />
                        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            <div className="flex items-center">
                                <FaRegCommentAlt className="mr-2 text-blue-500" />
                                Message to Freelancer
                            </div>
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="3"
                            className={`w-full px-3 py-2 border rounded-md ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Explain why you're making this counter offer..."
                        ></textarea>
                        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Submitting...' : 'Submit Counter Offer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CounterOfferModal;