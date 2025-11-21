<?php
namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TraineeGroup;
use App\Http\Resources\TrainingSessionResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TrainingSessionController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, TraineeGroup $group)
    {
        $this->authorize('view', $group);

        $query = $group->trainingSessions();
        $status = $request->input('status', 'Scheduled');

        if ($status === 'Scheduled') {
            // Scheduled
            $query->where('start_datetime', '>', now())
                  ->where('status', 'Scheduled')
                  ->orderBy('start_datetime', 'asc');
        } else {
            // Completed
            $query->where('end_datetime', '<=', now())
                  ->where('status', 'Completed')
                  ->orderBy('start_datetime', 'desc');
        }

        return TrainingSessionResource::collection($query->paginate(10));
    }
}