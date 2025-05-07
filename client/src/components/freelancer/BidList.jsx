import { useState, useEffect } from 'react';
import { bidService } from '../../utils/bidService';
import { socketService } from '../../utils/socketService';
import { useAuth } from '../../context/AuthContext';
import { FaSort, FaSortUp, FaSortDown, FaUserCircle, FaCheck, FaTimes, FaExchangeAlt } from 'react-icons/fa';
import CounterOfferModal from '../client/CounterOfferModal';
import toast from 'react-hot-toast';

const BidList = ({ projectId, projectStatus }) => {
    const { user } = useAuth();
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: 'all' });
    const [sort, setSort] = useState({ field: 'createdAt', order: 'desc' });
    const [selectedBid, setSelectedBid] = useState(null);
    const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);

    useEffect(() => {
        // Load bids on component mount
        loadBids();
        
        // Setup socket event callbacks
        const callbacks = {
            onNewBid: handleNewBid,
            onBidStatusUpdated: handleBidStatusUpdate,
            onCounterOfferReceived: handleCounterOfferReceived,
            onCounterOfferAccepted: handleCounterOfferAccepted
        };
        
        // Subscribe to bid events
        socketService.subscribeToProjectBids(projectId, callbacks);
        
        // Cleanup function
        return () => {
            socketService.unsubscribeFromProjectBids(callbacks);
            socketService.leaveProject(projectId);
        };
    }, [projectId]);

    // Reload bids when filters or sort changes
    useEffect(() => {
        loadBids();
    }, [filters, sort]);

    const loadBids = async () => {
        try {
            setLoading(true);
            const data = await bidService.getProjectBids(projectId);
            
            // Apply filters
            let filteredBids = data;
            if (filters.status !== 'all') {
                filteredBids = data.filter(bid => bid.status === filters.status);
            }
            
            // Apply sorting
            filteredBids.sort((a, b) => {
                const fieldA = a[sort.field];
                const fieldB = b[sort.field];
                
                if (sort.field === 'createdAt' || sort.field === 'updatedAt') {
                    return sort.order === 'asc' 
                        ? new Date(fieldA) - new Date(fieldB)
                        : new Date(fieldB) - new Date(fieldA);
                }
                
                if (typeof fieldA === 'number' && typeof fieldB === 'number') {
                    return sort.order === 'asc' ? fieldA - fieldB : fieldB - fieldA;
                }
                
                return sort.order === 'asc'
                    ? String(fieldA).localeCompare(String(fieldB))
                    : String(fieldB).localeCompare(String(fieldA));
            });
            
            setBids(filteredBids);
        } catch (error) {
            toast.error('Error loading bids: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Socket event handlers
    const handleNewBid = (bid) => {
        setBids(prevBids => [bid, ...prevBids]);
        toast.success('A new bid has been submitted!');
    };

    const handleBidStatusUpdate = (update) => {
        setBids(prevBids => prevBids.map(bid => 
            bid._id === update.bidId ? { ...bid, status: update.status } : bid
        ));
        toast.success(`A bid status has been updated to ${update.status}`);
    };

    const handleCounterOfferReceived = (bid) => {
        setBids(prevBids => prevBids.map(b => b._id === bid._id ? bid : b));
        
        // If the counter-offer is for the current user
        if (user.role === 'freelancer' && bid.freelancerId._id === user.id) {
            toast.success('You have received a counter offer!');
        }
    };

    const handleCounterOfferAccepted = (bid) => {
        setBids(prevBids => prevBids.map(b => b._id === bid._id ? bid : b));
        toast.success('Counter offer has been accepted!');
    };

    // Bid actions
    const handleUpdateStatus = async (bidId, newStatus) => {
        try {
            await bidService.updateBidStatus(bidId, newStatus);
            // Socket will handle the UI update
            toast.success(`Bid ${newStatus} successfully!`);
        } catch (error) {
            toast.error('Error updating bid status: ' + error.message);
        }
    };

    const handleCounterOffer = (bid) => {
        setSelectedBid(bid);
        setShowCounterOfferModal(true);
    };

    const handleSubmitCounterOffer = async (counterOfferData) => {
        try {
            await bidService.createCounterOffer(selectedBid._id, counterOfferData);
            setShowCounterOfferModal(false);
            // Socket will handle the UI update
            toast.success('Counter offer submitted successfully');
        } catch (error) {
            toast.error('Error submitting counter offer: ' + error.message);
        }
    };

    const handleAcceptCounterOffer = async (bidId) => {
        try {
            await bidService.acceptCounterOffer(bidId);
            // Socket will handle the UI update
            toast.success('Counter offer accepted!');
        } catch (error) {
            toast.error('Error accepting counter offer: ' + error.message);
        }
    };

    const handleSortChange = (field) => {
        setSort(prevSort => {
            if (prevSort.field === field) {
                return { field, order: prevSort.order === 'asc' ? 'desc' : 'asc' };
            }
            return { field, order: 'asc' };
        });
    };

    const getSortIcon = (field) => {
        if (sort.field !== field) return <FaSort className="ml-1 text-gray-400" />;
        return sort.order === 'asc' ? <FaSortUp className="ml-1 text-blue-500" /> : <FaSortDown className="ml-1 text-blue-500" />;
    };

    const renderBidStatus = (status) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
            case 'accepted':
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Accepted</span>;
            case 'rejected':
                return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Rejected</span>;
            case 'countered':
                return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Counter Offered</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>;
        }
    };

    const canUpdateBidStatus = (bid) => {
        return user?.role === 'client' && projectStatus === 'open' && bid.status === 'pending';
    };

    const canMakeCounterOffer = (bid) => {
        return user?.role === 'client' && projectStatus === 'open' && bid.status === 'pending';
    };

    const canAcceptCounterOffer = (bid) => {
        return user?.role === 'freelancer' && bid.status === 'countered' && bid.freelancerId._id === user.id;
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Filter and Sort Controls */}
            <div className="flex justify-between items-center p-4 border-b">
                <div>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="countered">Counter Offered</option>
                    </select>
                </div>
                <div className="text-sm text-gray-600">
                    {bids.length} {bids.length === 1 ? 'bid' : 'bids'} found
                </div>
            </div>

            {/* Bids List */}
            {loading ? (
                <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : bids.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No bids available for this project yet.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button 
                                        onClick={() => handleSortChange('freelancerId')}
                                        className="flex items-center font-medium"
                                    >
                                        Freelancer {getSortIcon('freelancerId')}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button 
                                        onClick={() => handleSortChange('amount')}
                                        className="flex items-center font-medium"
                                    >
                                        Amount {getSortIcon('amount')}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button 
                                        onClick={() => handleSortChange('deliveryTime')}
                                        className="flex items-center font-medium"
                                    >
                                        Delivery Time {getSortIcon('deliveryTime')}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button 
                                        onClick={() => handleSortChange('status')}
                                        className="flex items-center font-medium"
                                    >
                                        Status {getSortIcon('status')}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button 
                                        onClick={() => handleSortChange('createdAt')}
                                        className="flex items-center font-medium"
                                    >
                                        Date {getSortIcon('createdAt')}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bids.map((bid) => (
                                <tr key={bid._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <FaUserCircle className="h-10 w-10 text-gray-400" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {bid.freelancerId.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {bid.freelancerId.verified && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">${bid.amount}</div>
                                        {bid.counterOffer && (
                                            <div className="text-xs text-blue-600">
                                                Counter: ${bid.counterOffer.amount}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{bid.deliveryTime} days</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {renderBidStatus(bid.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(bid.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {canUpdateBidStatus(bid) && (
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(bid._id, 'accepted')}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Accept Bid"
                                                >
                                                    <FaCheck />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(bid._id, 'rejected')}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Reject Bid"
                                                >
                                                    <FaTimes />
                                                </button>
                                                <button
                                                    onClick={() => handleCounterOffer(bid)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Make Counter Offer"
                                                >
                                                    <FaExchangeAlt />
                                                </button>
                                            </div>
                                        )}
                                        
                                        {canAcceptCounterOffer(bid) && (
                                            <button
                                                onClick={() => handleAcceptCounterOffer(bid._id)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Accept Counter Offer
                                            </button>
                                        )}
                                        
                                        <button 
                                            className="text-blue-600 hover:text-blue-900 ml-2"
                                            onClick={() => setSelectedBid(bid)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Counter Offer Modal */}
            {showCounterOfferModal && selectedBid && (
                <CounterOfferModal
                    bid={selectedBid}
                    onClose={() => setShowCounterOfferModal(false)}
                    onSubmit={handleSubmitCounterOffer}
                />
            )}
        </div>
    );
};

export default BidList;